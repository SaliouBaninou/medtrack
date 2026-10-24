import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { and, count, eq, ilike, isNull, not, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { hospitalAdmin, user } from "../db/schema.js";
import { auth } from "../lib/auth.js";
import type { AuthenticatedLocals } from "../middleware/authentication.js";
import type { CreateAdminInput, HospitalAdminFilterInput, HospitalAdminIdParams, UpdateAdminInput } from "../zod-schema/hospital-admins.js";

type HospitalAdminLocals = Partial<AuthenticatedLocals> & {
  validatedQuery?: HospitalAdminFilterInput;
};

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && "cause" in error &&
  typeof error.cause === "object" && error.cause !== null &&
  "code" in error.cause && error.cause.code === "23505";

export const createHospitalAdmin = async (
  req: Request<{}, {}, CreateAdminInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const [account] = await db.select({ role: user.role }).from(user).where(eq(user.id, req.body.userId)).limit(1);
    if (!account) {
      return res.status(404).json({ success: false, message: "Le compte utilisateur indiqué n'existe pas." });
    }
    if (String(account.role ?? "").split(",").map((role) => role.trim()).includes("superadmin")) {
      return res.status(409).json({
        success: false,
        message: "Un compte superadmin ne peut pas être converti en administrateur d'établissement.",
      });
    }

    const [created] = await db.insert(hospitalAdmin).values({
      userId: req.body.userId,
      etablissementId: req.body.etablissementId,
      profession: req.body.profession,
      telephone: req.body.telephone,
      previousRole: account.role ?? "patient",
    }).returning();
    if (!created) {
      throw new Error("La création du profil administrateur n'a retourné aucune ligne.");
    }

    try {
      await auth.api.setRole({
        body: { userId: req.body.userId, role: "admin" },
        headers: fromNodeHeaders(req.headers),
      });
    } catch (roleError) {
      // Better Auth owns role updates. Remove the profile if its role update fails.
      await db.delete(hospitalAdmin).where(eq(hospitalAdmin.id, created.id));
      throw roleError;
    }

    return res.status(201).json({
      success: true,
      message: "Administrateur créé avec succès.",
      admin: created,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        success: false,
        message: "Un profil administrateur existe déjà pour ce compte.",
        field: "userId",
      });
    }
    if (typeof error === "object" && error !== null && "cause" in error &&
      typeof error.cause === "object" && error.cause !== null &&
      "code" in error.cause && error.cause.code === "23503") {
      return res.status(404).json({
        success: false,
        message: "Le compte utilisateur ou l'établissement indiqué n'existe pas.",
      });
    }
    console.error("Erreur création administrateur :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création de l'administrateur.",
    });
  }
};

export const getAdminsByHospital = async (
  _req: Request,
  res: Response<unknown, HospitalAdminLocals>,
) => {
  try {
    const { etablissementId, page, limit, search } = res.locals.validatedQuery!;
    const searchFilter = search
      ? or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`),
          ilike(hospitalAdmin.profession, `%${search}%`),
          ilike(hospitalAdmin.telephone, `%${search}%`),
        )
      : undefined;
    const filters = and(eq(hospitalAdmin.etablissementId, etablissementId), searchFilter);
    const [total] = await db.select({ total: count() })
      .from(hospitalAdmin)
      .innerJoin(user, eq(hospitalAdmin.userId, user.id))
      .where(filters);
    const rows = await db.select({
      id: hospitalAdmin.id,
      userId: hospitalAdmin.userId,
      etablissementId: hospitalAdmin.etablissementId,
      profession: hospitalAdmin.profession,
      telephone: hospitalAdmin.telephone,
      banned: user.banned,
      banReason: user.banReason,
      created_at: hospitalAdmin.created_at,
      name: user.name,
      email: user.email,
    })
      .from(hospitalAdmin)
      .innerJoin(user, eq(hospitalAdmin.userId, user.id))
      .where(filters)
      .orderBy(user.name)
      .limit(limit)
      .offset((page - 1) * limit);
    const totalItems = Number(total?.total ?? 0);

    return res.status(200).json({
      success: true,
      admins: rows,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération des administrateurs :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des administrateurs.",
    });
  }
};

export const updateAdmin = async (
  req: Request<HospitalAdminIdParams, {}, UpdateAdminInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const [updated] = await db.update(hospitalAdmin)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(hospitalAdmin.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ success: false, message: "L'administrateur n'existe pas." });
    return res.status(200).json({ success: true, message: "Administrateur mis à jour avec succès.", admin: updated });
  } catch (error) {
    console.error("Erreur mise à jour administrateur :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la mise à jour de l'administrateur." });
  }
};

const getAdminAccount = async (adminId: string) => {
  const [record] = await db.select({ id: hospitalAdmin.id, userId: hospitalAdmin.userId, previousRole: hospitalAdmin.previousRole })
    .from(hospitalAdmin)
    .where(eq(hospitalAdmin.id, adminId))
    .limit(1);
  return record;
};

export const banAdmin = async (
  req: Request<HospitalAdminIdParams>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const record = await getAdminAccount(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "L'administrateur n'existe pas." });
    await auth.api.banUser({
      body: { userId: record.userId, banReason: "Compte administrateur suspendu par le superadmin." },
      headers: fromNodeHeaders(req.headers),
    });
    return res.status(200).json({ success: true, message: "Administrateur banni avec succès." });
  } catch (error) {
    console.error("Erreur bannissement administrateur :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors du bannissement de l'administrateur." });
  }
};

export const unbanAdmin = async (
  req: Request<HospitalAdminIdParams>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const record = await getAdminAccount(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "L'administrateur n'existe pas." });
    await auth.api.unbanUser({ body: { userId: record.userId }, headers: fromNodeHeaders(req.headers) });
    return res.status(200).json({ success: true, message: "Administrateur réactivé avec succès." });
  } catch (error) {
    console.error("Erreur réactivation administrateur :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la réactivation de l'administrateur." });
  }
};

export const deleteAdmin = async (
  req: Request<HospitalAdminIdParams>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const record = await getAdminAccount(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "L'administrateur n'existe pas." });

    const previousRoles = record.previousRole.split(",").map((role) => role.trim()).filter(
      (role): role is "admin" | "medecin" | "patient" | "superadmin" =>
        ["admin", "medecin", "patient", "superadmin"].includes(role),
    );

    await auth.api.setRole({
      body: { userId: record.userId, role: previousRoles.length ? previousRoles : "patient" },
      headers: fromNodeHeaders(req.headers),
    });

    const [deleted] = await db.delete(hospitalAdmin)
      .where(eq(hospitalAdmin.id, req.params.id))
      .returning({ id: hospitalAdmin.id });
    if (!deleted) {
      await auth.api.setRole({
        body: { userId: record.userId, role: "admin" },
        headers: fromNodeHeaders(req.headers),
      });
      return res.status(404).json({ success: false, message: "L'administrateur n'existe plus." });
    }

    return res.status(200).json({ success: true, message: "Profil administrateur supprimé. Le compte utilisateur est conservé." });
  } catch (error) {
    console.error("Erreur suppression administrateur :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la suppression de l'administrateur." });
  }
};

export const searchAdminUsers = async (
  req: Request<{}, {}, {}, { search: string }>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const users = await db.select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .leftJoin(hospitalAdmin, eq(hospitalAdmin.userId, user.id))
      .where(and(
        ilike(user.email, `%${req.query.search}%`),
        isNull(hospitalAdmin.id),
        or(isNull(user.role), not(ilike(user.role, "%superadmin%"))),
      ))
      .orderBy(user.email)
      .limit(10);
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Erreur recherche des comptes administrateur :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la recherche des comptes.",
    });
  }
};

