import { Router } from "express";
import { validate } from "../utils/schema-validator.js";
import {
  createEtablissementSchema,
  etablissementFilterSchema,
  etablissementIdSchema,
  updateEtablissementSchema,
} from "../zod-schema/etablissements.js";
import {
  createEtablissement,
  deleteEtablissement,
  getEtablissementById,
  getEtablissements,
  updateEtablissement,
} from "../controllers/etablissement-controller.js";
import { requireAuthentication, requireRole } from "../middleware/authentication.js";
const router = Router();

router.post(
  "/etablissements",
  requireAuthentication,
  requireRole("admin"),
  validate({ body: createEtablissementSchema }),
  createEtablissement,
);

router.put(
  "/etablissements/:id",
  requireAuthentication,
  requireRole("admin"),
  validate({ params: etablissementIdSchema, body: updateEtablissementSchema }),
  updateEtablissement,
);

router.delete(
  "/etablissements/:id",
  requireAuthentication,
  requireRole("admin"),
  validate({ params: etablissementIdSchema }),
  deleteEtablissement,
);

router.get(
  "/etablissements",
  requireAuthentication,
  requireRole("admin", "patient", "medecin"),
  validate({ query: etablissementFilterSchema }),
  getEtablissements,
);


router.get(
  "/etablissements/:id",
  requireAuthentication,
  requireRole("admin", "patient", "medecin"),
  validate({ params: etablissementIdSchema }),
  getEtablissementById,
);


export default router;
