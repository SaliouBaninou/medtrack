import { Router } from "express";
import etablissementRouter from "./etablissements.js";
import patientRouter from "./patients.js";
import hospitalAdminRouter from "./hospital-admins.js";
import doctorRouter from "./doctors.js";

const router = Router();

router.use(etablissementRouter);

/**
 * @openapi
 * /api:
 *   get:
 *     summary: Vérification de l'état de l'API
 *     description: Point d'entrée de l'API permettant de vérifier sa disponibilité et son bon fonctionnement.
 *     tags:
 *       - Général
 *     responses:
 *       200:
 *         description: L'API est en ligne et fonctionnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sa:
 *                   type: string
 *                   example: "Bonjour"
 */
router.use(patientRouter);
router.use(hospitalAdminRouter);
router.use(doctorRouter);

export default router;
