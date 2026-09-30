import { Router } from "express";
import { validate } from "../utils/body-validator";
import { createEtablissementSchema } from "../zod-schema/etablissements";
import { createEtablissement } from "../controllers/etablissement-controller";
const router = Router();

router.post(
  "/etablissements",
  validate(createEtablissementSchema),
  createEtablissement,
);

export default router;
