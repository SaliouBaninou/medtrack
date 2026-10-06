import { Router } from "express";
import etablissementRouter from "./etablissements.js";

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
router.get("/", (req, res) => {
  res.status(200).json({ sa: "Bonjour" });
});

export default router;
