import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { and, count, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { doctor, etablissement, hospitalAdmin, user } from "../db/schema.js";
import { auth } from "../lib/auth.js";
import type { AuthenticatedLocals } from "../middleware/authentication.js";
import type { CreateDoctorInput, DoctorFilterInput, UpdateDoctorInput } from "../zod-schema/doctors.js";

type DoctorLocals = Partial<AuthenticatedLocals> & { validatedQuery?: DoctorFilterInput };

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && "cause" in error &&
  typeof error.cause === "object" && error.cause !== null &&
  "code" in error.cause && error.cause.code === "23505";

const getAdminHospital = async (userId: string) => {
  const [profile] = await db.select({ id: hospitalAdmin.id, etablissementId: hospitalAdmin.etablissementId })
    .from(hospitalAdmin)
    .where(eq(hospitalAdmin.userId, userId))
    .limit(1);
  return profile;
};

export const getDoctors = async (
  _req: Request,
  res: Response<unknown, DoctorLocals>,
) => {
  try {
    const hospital = await getAdminHospital(res.locals.user!.id);
    if (!hospital) {
      return res.status(403).json({ success: false, message: "Aucun établissement n'est associé à ce compte administrateur." });
    }

    const { page, limit, search } = res.locals.validatedQuery!;
    const searchFilter = search
      ? or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`),
          ilike(doctor.specialty, `%${search}%`),
          ilike(doctor.department, `%${search}%`),
          ilike(doctor.professionalId, `%${search}%`),
        )
      : undefined;
    const filters = and(eq(doctor.etablissementId, hospital.etablissementId), searchFilter);
    const [total] = await db.select({ total: count() })
      .from(doctor)
      .innerJoin(user, eq(doctor.userId, user.id))
      .where(filters);
    const rows = await db.select({
      doctor: {
        id: doctor.id,
        userId: doctor.userId,
        specialty: doctor.specialty,
        department: doctor.department,
        professionalId: doctor.professionalId,
        phone: doctor.phone,
        status: doctor.status,
        etablissementId: doctor.etablissementId,
        created_at: doctor.created_at,
      },
      user: { id: user.id, name: user.name, email: user.email, banned: user.banned, banReason: user.banReason },
    })
      .from(doctor)
      .innerJoin(user, eq(doctor.userId, user.id))
      .where(filters)
      .orderBy(user.name)
      .limit(limit)
      .offset((page - 1) * limit);
    const totalItems = Number(total?.total ?? 0);
    const [hospitalInfo] = await db.select({ id: etablissement.id, name: etablissement.name })
      .from(etablissement)
      .where(eq(etablissement.id, hospital.etablissementId))
      .limit(1);

    return res.status(200).json({
      success: true,
      doctors: rows.map(({ doctor: profile, user: account }) => ({ ...profile, user: account })),
      etablissement: hospitalInfo,
      pagination: { currentPage: page, perPage: limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    });
  } catch (error) {
    console.error("Erreur récupération des médecins :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la récupération des médecins." });
  }
};

export const searchDoctorAccounts = async (
  req: Request<{}, {}, {}, { search: string }>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const accounts = await db.select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .leftJoin(doctor, eq(doctor.userId, user.id))
      .where(and(
        ilike(user.email, `%${req.query.search}%`),
        isNull(doctor.id),
        or(isNull(user.role), eq(user.role, "patient"), eq(user.role, "medecin")),
      ))
      .orderBy(user.email)
      .limit(10);
    return res.status(200).json({ success: true, users: accounts });
  } catch (error) {
    console.error("Erreur recherche comptes médecin :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la recherche des comptes." });
  }
};

export const createDoctor = async (
  req: Request<{}, {}, CreateDoctorInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const hospital = await getAdminHospital(res.locals.user!.id);
    if (!hospital) {
      return res.status(403).json({ success: false, message: "Aucun établissement n'est associé à ce compte administrateur." });
    }

    const [account] = await db.select({ role: user.role }).from(user).where(eq(user.id, req.body.userId)).limit(1);
    if (!account) return res.status(404).json({ success: false, message: "Le compte utilisateur indiqué n'existe pas." });
    if (!([null, "patient", "medecin"].includes(account.role))) {
      return res.status(409).json({ success: false, message: "Seuls les comptes patient ou médecin sans profil peuvent être associés." });
    }

    const [created] = await db.insert(doctor).values({
      userId: req.body.userId,
      specialty: req.body.specialty,
      department: req.body.department,
      professionalId: req.body.professionalId || null,
      phone: req.body.phone || null,
      status: req.body.status,
      etablissementId: hospital.etablissementId,
      previousRole: account.role ?? "patient",
    }).returning();
    if (!created) throw new Error("La création du profil médecin n'a retourné aucune ligne.");

    try {
      await auth.api.setRole({
        body: { userId: req.body.userId, role: "medecin" },
        headers: fromNodeHeaders(req.headers),
      });
    } catch (roleError) {
      await db.delete(doctor).where(eq(doctor.id, created.id));
      throw roleError;
    }

    return res.status(201).json({ success: true, message: "Médecin créé avec succès.", doctor: created });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({ success: false, message: "Ce compte ou cet identifiant professionnel est déjà associé à un profil médecin." });
    }
    if (typeof error === "object" && error !== null && "cause" in error &&
      typeof error.cause === "object" && error.cause !== null &&
      "code" in error.cause && error.cause.code === "23503") {
      return res.status(404).json({ success: false, message: "Le compte utilisateur ou l'établissement indiqué n'existe pas." });
    }
    console.error("Erreur création médecin :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la création du médecin." });
  }
};

const getManagedDoctor = async (doctorId: string, adminUserId: string) => {
  const hospital = await getAdminHospital(adminUserId);
  if (!hospital) return { hospital: null, doctorProfile: null };
  const [doctorProfile] = await db.select().from(doctor).where(and(
    eq(doctor.id, doctorId), eq(doctor.etablissementId, hospital.etablissementId),
  )).limit(1);
  return { hospital, doctorProfile };
};

export const updateDoctor = async (
  req: Request<{ id: string }, {}, UpdateDoctorInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const { doctorProfile } = await getManagedDoctor(req.params.id, res.locals.user!.id);
    if (!doctorProfile) return res.status(404).json({ success: false, message: "Ce médecin n'appartient pas à votre établissement ou n'existe pas." });
    const [updated] = await db.update(doctor).set({
      specialty: req.body.specialty, department: req.body.department,
      professionalId: req.body.professionalId || null, phone: req.body.phone || null,
      status: req.body.status, updated_at: new Date(),
    }).where(eq(doctor.id, doctorProfile.id)).returning();
    return res.status(200).json({ success: true, message: "Profil médecin modifié.", doctor: updated });
  } catch (error) {
    if (isUniqueViolation(error)) return res.status(409).json({ success: false, message: "Cet identifiant professionnel est déjà utilisé." });
    console.error("Erreur modification médecin :", error);
    return res.status(500).json({ success: false, message: "Impossible de modifier ce médecin." });
  }
};

export const setDoctorBan = async (
  req: Request<{ id: string }, {}, { banned: boolean }>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const { doctorProfile } = await getManagedDoctor(req.params.id, res.locals.user!.id);
    if (!doctorProfile) return res.status(404).json({ success: false, message: "Ce médecin n'appartient pas à votre établissement ou n'existe pas." });
    if (doctorProfile.userId === res.locals.user!.id) return res.status(403).json({ success: false, message: "Vous ne pouvez pas suspendre votre propre compte." });
    if (req.body.banned) {
      await auth.api.banUser({ body: { userId: doctorProfile.userId, banReason: "Compte médecin suspendu par l'administrateur de son établissement." }, headers: fromNodeHeaders(req.headers) });
    } else {
      await auth.api.unbanUser({ body: { userId: doctorProfile.userId }, headers: fromNodeHeaders(req.headers) });
    }
    return res.status(200).json({ success: true, message: req.body.banned ? "Compte médecin suspendu." : "Compte médecin réactivé." });
  } catch (error) {
    console.error("Erreur suspension médecin :", error);
    return res.status(500).json({ success: false, message: "Impossible de modifier l'état du compte médecin." });
  }
};

export const deleteDoctor = async (
  req: Request<{ id: string }>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const { doctorProfile } = await getManagedDoctor(req.params.id, res.locals.user!.id);
    if (!doctorProfile) return res.status(404).json({ success: false, message: "Ce médecin n'appartient pas à votre établissement ou n'existe pas." });
    await db.delete(doctor).where(eq(doctor.id, doctorProfile.id));
    return res.status(200).json({ success: true, message: "Profil médecin supprimé. Le compte utilisateur est conservé." });
  } catch (error) {
    console.error("Erreur suppression médecin :", error);
    return res.status(500).json({ success: false, message: "Impossible de supprimer ce médecin." });
  }
};
