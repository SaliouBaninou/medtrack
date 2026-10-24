import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { and, count, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { doctor, hospitalAdmin, patient, user } from "../db/schema.js";
import { auth } from "../lib/auth.js";
import type { AuthenticatedLocals } from "../middleware/authentication.js";
import type {
  CreatePatientInput,
  PatientFilterInput,
  PatientIdInput,
  UpdatePatientInput,
} from "../zod-schema/patients.js";

type PatientLocals = Partial<AuthenticatedLocals> & {
  validatedQuery?: PatientFilterInput | { search: string };
};
type PatientScope = { kind: "all" } | { kind: "hospital"; etablissementId: string } | { kind: "none" };

const rolesFor = (role: string | null | undefined) => String(role ?? "patient").split(",").map((value) => value.trim());

const getPatientScope = async (role: string | null | undefined, userId: string): Promise<PatientScope> => {
  const roles = rolesFor(role);
  if (roles.includes("superadmin")) return { kind: "all" };
  if (roles.includes("admin")) {
    const [profile] = await db.select({ etablissementId: hospitalAdmin.etablissementId })
      .from(hospitalAdmin).where(eq(hospitalAdmin.userId, userId)).limit(1);
    return profile ? { kind: "hospital", etablissementId: profile.etablissementId } : { kind: "none" };
  }
  if (roles.includes("medecin")) {
    const [profile] = await db.select({ etablissementId: doctor.etablissementId })
      .from(doctor).where(eq(doctor.userId, userId)).limit(1);
    return profile ? { kind: "hospital", etablissementId: profile.etablissementId } : { kind: "none" };
  }
  return { kind: "none" };
};

const hasPatientScope = (scope: PatientScope, etablissementId: string | null) =>
  scope.kind === "all" || (scope.kind === "hospital" && scope.etablissementId === etablissementId);

export const createPatient = async (
  req: Request<{}, {}, CreatePatientInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const [created] = await db.insert(patient).values({ ...req.body, userId: res.locals.user!.id }).returning();
    return res.status(201).json({ success: true, message: "Profil patient créé avec succès", patient: created });
  } catch (error) {
    console.error("Erreur création patient :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la création du profil patient." });
  }
};

export const getMyPatient = async (
  _req: Request,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const data = await db.query.patient.findFirst({ where: { userId: res.locals.user!.id } });
    if (!data) return res.status(404).json({ success: false, message: "Aucun profil patient n'est associé à ce compte." });
    return res.status(200).json({ success: true, patient: data });
  } catch (error) {
    console.error("Erreur récupération du profil patient :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la récupération du profil patient." });
  }
};

export const getPatients = async (
  _req: Request,
  res: Response<unknown, PatientLocals>,
) => {
  try {
    const scope = await getPatientScope(res.locals.user?.role, res.locals.user!.id);
    if (scope.kind === "none") return res.status(403).json({ success: false, message: "Aucun établissement n'est associé à ce compte." });
    const { page, limit, search } = res.locals.validatedQuery as PatientFilterInput;
    const searchFilter = search
      ? or(
          ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`),
          ilike(patient.phone, `%${search}%`), ilike(patient.residence, `%${search}%`),
        )
      : undefined;
    const hospitalFilter = scope.kind === "hospital" ? eq(patient.etablissementId, scope.etablissementId) : undefined;
    const filters = and(hospitalFilter, searchFilter);
    const [total] = await db.select({ total: count() })
      .from(patient).innerJoin(user, eq(patient.userId, user.id)).where(filters);
    const rows = await db.select({
      patient,
      user: { id: user.id, name: user.name, email: user.email, banned: user.banned, banReason: user.banReason },
    })
      .from(patient).innerJoin(user, eq(patient.userId, user.id)).where(filters)
      .limit(limit).offset((page - 1) * limit).orderBy(user.name);
    const totalItems = Number(total?.total ?? 0);
    return res.status(200).json({
      success: true,
      patients: rows.map(({ patient: profile, user: account }) => ({ ...profile, user: account, banned: account.banned, banReason: account.banReason })),
      pagination: { currentPage: page, perPage: limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    });
  } catch (error) {
    console.error("Erreur récupération des patients :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la récupération des patients." });
  }
};

export const getUnassignedPatients = async (
  _req: Request,
  res: Response<unknown, PatientLocals>,
) => {
  try {
    const scope = await getPatientScope(res.locals.user?.role, res.locals.user!.id);
    if (!rolesFor(res.locals.user?.role).includes("admin") || scope.kind !== "hospital") {
      return res.status(403).json({ success: false, message: "Cette recherche est réservée à l'administrateur d'un établissement." });
    }
    const { search } = res.locals.validatedQuery as { search: string };
    const rows = await db.select({
      id: patient.id,
      userId: patient.userId,
      name: user.name,
      email: user.email,
    })
      .from(patient).innerJoin(user, eq(patient.userId, user.id))
      .where(and(isNull(patient.etablissementId), or(ilike(user.email, `%${search}%`), ilike(user.name, `%${search}%`))))
      .orderBy(user.name).limit(10);
    return res.status(200).json({ success: true, patients: rows });
  } catch (error) {
    console.error("Erreur recherche patients non associés :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la recherche des patients." });
  }
};

export const assignPatientToHospital = async (
  req: Request<PatientIdInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const scope = await getPatientScope(res.locals.user?.role, res.locals.user!.id);
    if (scope.kind !== "hospital" || !rolesFor(res.locals.user?.role).includes("admin")) {
      return res.status(403).json({ success: false, message: "Seul un administrateur d'établissement peut associer un patient." });
    }
    const [assigned] = await db.update(patient)
      .set({ etablissementId: scope.etablissementId, updated_at: new Date() })
      .where(and(eq(patient.id, req.params.id), isNull(patient.etablissementId)))
      .returning({ id: patient.id, etablissementId: patient.etablissementId });
    if (assigned) return res.status(200).json({ success: true, message: "Patient associé à votre établissement." });
    const existing = await db.query.patient.findFirst({ where: { id: req.params.id } });
    return res.status(existing ? 409 : 404).json({
      success: false,
      message: existing ? "Ce patient est déjà associé à un établissement." : "Le patient n'existe pas.",
    });
  } catch (error) {
    console.error("Erreur association patient :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de l'association du patient." });
  }
};

const findPatient = (id: string) => db.query.patient.findFirst({ where: { id } });

const canManagePatient = async (role: string | null | undefined, requesterId: string, patientData: { userId: string; etablissementId: string | null }) => {
  if (requesterId === patientData.userId) return true;
  const scope = await getPatientScope(role, requesterId);
  return scope.kind !== "none" && hasPatientScope(scope, patientData.etablissementId);
};

export const getPatient = async (
  req: Request<PatientIdInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const data = await findPatient(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Le patient n'existe pas." });
    if (!(await canManagePatient(res.locals.user?.role, res.locals.user!.id, data))) {
      return res.status(403).json({ success: false, message: "Ce patient n'est pas associé à votre établissement." });
    }
    return res.status(200).json({ success: true, patient: data });
  } catch (error) {
    console.error("Erreur récupération patient :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la récupération du patient." });
  }
};

export const updatePatient = async (
  req: Request<PatientIdInput, {}, UpdatePatientInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const existing = await findPatient(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Le patient n'existe pas." });
    if (!(await canManagePatient(res.locals.user?.role, res.locals.user!.id, existing))) {
      return res.status(403).json({ success: false, message: "Ce patient n'est pas associé à votre établissement." });
    }
    const [updated] = await db.update(patient).set({ ...req.body, updated_at: new Date() })
      .where(eq(patient.id, req.params.id)).returning();
    return res.status(200).json({ success: true, message: "Profil patient mis à jour avec succès", patient: updated });
  } catch (error) {
    console.error("Erreur mise à jour patient :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la mise à jour du patient." });
  }
};

export const banPatient = async (
  req: Request<PatientIdInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const existing = await findPatient(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Le patient n'existe pas." });
    if (!(await canManagePatient(res.locals.user?.role, res.locals.user!.id, existing)) || existing.userId === res.locals.user!.id) {
      return res.status(403).json({ success: false, message: "Vous ne pouvez pas bannir ce patient." });
    }
    await auth.api.banUser({
      body: { userId: existing.userId, banReason: "Compte patient suspendu par l'administrateur de son établissement." },
      headers: fromNodeHeaders(req.headers),
    });
    return res.status(200).json({ success: true, message: "Patient banni avec succès." });
  } catch (error) {
    console.error("Erreur bannissement patient :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors du bannissement du patient." });
  }
};

export const unbanPatient = async (
  req: Request<PatientIdInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const existing = await findPatient(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Le patient n'existe pas." });
    if (!(await canManagePatient(res.locals.user?.role, res.locals.user!.id, existing)) || existing.userId === res.locals.user!.id) {
      return res.status(403).json({ success: false, message: "Vous ne pouvez pas réactiver ce patient." });
    }
    await auth.api.unbanUser({ body: { userId: existing.userId }, headers: fromNodeHeaders(req.headers) });
    return res.status(200).json({ success: true, message: "Patient réactivé avec succès." });
  } catch (error) {
    console.error("Erreur réactivation patient :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la réactivation du patient." });
  }
};

export const deletePatient = async (
  req: Request<PatientIdInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const existing = await findPatient(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Le patient n'existe pas." });
    if (!(await canManagePatient(res.locals.user?.role, res.locals.user!.id, existing))) {
      return res.status(403).json({ success: false, message: "Ce patient n'est pas associé à votre établissement." });
    }
    const [deleted] = await db.delete(patient).where(eq(patient.id, req.params.id)).returning({ id: patient.id });
    if (!deleted) return res.status(404).json({ success: false, message: "Le patient n'existe plus." });
    return res.status(200).json({ success: true, message: "Profil patient supprimé. Le compte utilisateur est conservé." });
  } catch (error) {
    console.error("Erreur suppression patient :", error);
    return res.status(500).json({ success: false, message: "Une erreur est survenue lors de la suppression du patient." });
  }
};
