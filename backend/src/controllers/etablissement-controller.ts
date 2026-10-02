import type { Request, Response } from "express";
import { count, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { etablissement } from "../db/schema.js";
import type {
  EtablissementFilterInput,
  EtablissementIdInput,
  UpdateEtablissementInput,
} from "../zod-schema/etablissements.js";
import type { AuthenticatedLocals } from "../middleware/authentication.js";

type EtablissementLocals = Partial<AuthenticatedLocals> & {
  validatedQuery?: EtablissementFilterInput;
};

type EtablissementParams = EtablissementIdInput;

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null &&
  "cause" in error && typeof error.cause === "object" && error.cause !== null &&
  "code" in error.cause && error.cause.code === "23505";

/**
 * Crée un nouvel établissement dans la base de données.
 *
 * @param req - La requête HTTP contenant les données de l'établissement à créer.
 * @param res - La réponse HTTP à envoyer.
 */

export const createEtablissement = async (
  req: Request,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const [created] = await db
      .insert(etablissement)
      .values({ ...req.body, userId: res.locals.user!.id })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Établissement créé avec succès",
      etablissement: created,
    });
  } catch (error) {
    console.error("Erreur création établissement :", error);

    if (isUniqueViolation(error)) {
      return res.status(409).json({
        success: false,
        message: "Un établissement avec ce nom existe déjà.",
        field: "name",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création de l'établissement.",
    });
  }
};


/**
 * Récupère la liste des établissements avec pagination et filtres.
 *
 * @param _req - La requête HTTP.
 * @param res - La réponse HTTP à envoyer.
 */

export const getEtablissements = async (
  _req: Request,
  res: Response<unknown, EtablissementLocals>,
) => {
  try {
    const { page, limit, search } = res.locals.validatedQuery as EtablissementFilterInput;
    const filters = search
      ? or(
          ilike(etablissement.name, `%${search}%`),
          ilike(etablissement.address, `%${search}%`),
          ilike(etablissement.email, `%${search}%`),
        )
      : undefined;
    const offset = (page - 1) * limit;

    const [result] = await db
      .select({ total: count() })
      .from(etablissement)
      .where(filters);

    const etablissements = await db
      .select()
      .from(etablissement)
      .where(filters)
      .limit(limit)
      .offset(offset)
      .orderBy(etablissement.name);

    return res.status(200).json({
      success: true,
      etablissements,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalItems: Number(result?.total ?? 0),
        totalPages: Math.ceil(Number(result?.total ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération établissements :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des établissements.",
    });
  }
};


/**
 * Récupère un établissement par son ID.
 *
 * @param req - La requête HTTP contenant l'ID de l'établissement.
 * @param res - La réponse HTTP à envoyer.
 */

export const getEtablissementById = async (
  req: Request<EtablissementParams>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const { id } = req.params;
    const data = await db.query.etablissement.findFirst({ where: { id } });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "L'établissement n'existe pas.",
      });
    }

    return res.status(200).json({ success: true, etablissement: data });
  } catch (error) {
    console.error("Erreur récupération établissement :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération de l'établissement.",
    });
  }
};


/**
 * Met à jour un établissement existant.
 *
 * @param req - La requête HTTP contenant les données à mettre à jour.
 * @param res - La réponse HTTP à envoyer.
 */
export const updateEtablissement = async (
  req: Request<EtablissementParams, {}, UpdateEtablissementInput>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const { id } = req.params;
    const [updated] = await db
      .update(etablissement)
      .set(req.body)
      .where(eq(etablissement.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "L'établissement n'existe pas.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Établissement mis à jour avec succès",
      etablissement: updated,
    });
  } catch (error) {
    console.error("Erreur mise à jour établissement :", error);

    if (isUniqueViolation(error)) {
      return res.status(409).json({
        success: false,
        message: "Un établissement avec ce nom existe déjà.",
        field: "name",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la mise à jour de l'établissement.",
    });
  }
};


/**
 * Supprime un établissement par son ID.
 *
 * @param req - La requête HTTP contenant l'ID de l'établissement.
 * @param res - La réponse HTTP à envoyer.
 */
export const deleteEtablissement = async (
  req: Request<EtablissementParams>,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
) => {
  try {
    const { id } = req.params;
    const [deleted] = await db
      .delete(etablissement)
      .where(eq(etablissement.id, id))
      .returning({ id: etablissement.id });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "L'établissement n'existe pas.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Établissement supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur suppression établissement :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la suppression de l'établissement.",
    });
  }
};
