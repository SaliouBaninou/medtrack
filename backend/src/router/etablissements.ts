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

/**
 * @openapi
 * /api/etablissements:
 *   post:
 *     summary: Créer un nouvel établissement
 *     description: Permet à un utilisateur avec le rôle **admin** ou **superadmin** de créer un nouvel établissement de santé. Le nom de l'établissement doit être unique.
 *     tags:
 *       - Établissements
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEtablissementInput'
 *     responses:
 *       201:
 *         description: Établissement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateEtablissementResponse'
 *       400:
 *         description: Données de validation invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Non authentifié (session requise)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Droits insuffisants (rôle admin requis)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflit - Le nom de l'établissement est déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictErrorResponse'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/etablissements",
  requireAuthentication,
  requireRole("admin"),
  validate({ body: createEtablissementSchema }),
  createEtablissement,
);

/**
 * @openapi
 * /api/etablissements/{id}:
 *   put:
 *     summary: Mettre à jour un établissement
 *     description: Permet à un utilisateur avec le rôle **admin** ou **superadmin** de modifier un établissement existant. Au moins un champ modifiable doit être fourni.
 *     tags:
 *       - Établissements
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant UUID de l'établissement à modifier
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEtablissementInput'
 *     responses:
 *       200:
 *         description: Établissement mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateEtablissementResponse'
 *       400:
 *         description: Données fournies invalides (ou aucun champ fourni)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Droits insuffisants (rôle admin requis)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Établissement introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflit - Le nouveau nom est déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictErrorResponse'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/etablissements/:id",
  requireAuthentication,
  requireRole("admin"),
  validate({ params: etablissementIdSchema, body: updateEtablissementSchema }),
  updateEtablissement,
);

/**
 * @openapi
 * /api/etablissements/{id}:
 *   delete:
 *     summary: Supprimer un établissement
 *     description: Permet à un utilisateur avec le rôle **admin** ou **superadmin** de supprimer définitivement un établissement de santé.
 *     tags:
 *       - Établissements
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant UUID de l'établissement à supprimer
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Établissement supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteEtablissementResponse'
 *       400:
 *         description: Identifiant invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Droits insuffisants (rôle admin requis)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Établissement introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/etablissements/:id",
  requireAuthentication,
  requireRole("admin"),
  validate({ params: etablissementIdSchema }),
  deleteEtablissement,
);

/**
 * @openapi
 * /api/etablissements:
 *   get:
 *     summary: Lister les établissements de santé
 *     description: Récupère la liste paginée des établissements avec possibilité de recherche textuelle insensible à la casse dans le nom, l'adresse ou l'e-mail. Accessible aux rôles **admin**, **medecin**, et **patient**.
 *     tags:
 *       - Établissements
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de la page à récupérer (commence à 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Nombre d'éléments par page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 255
 *         description: Chaîne de recherche pour filtrer par nom, adresse ou e-mail
 *     responses:
 *       200:
 *         description: Liste paginée des établissements récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetEtablissementsResponse'
 *       400:
 *         description: Paramètres de pagination ou filtres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Droits insuffisants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/etablissements",
  requireAuthentication,
  requireRole("admin", "patient", "medecin"),
  validate({ query: etablissementFilterSchema }),
  getEtablissements,
);

/**
 * @openapi
 * /api/etablissements/{id}:
 *   get:
 *     summary: Récupérer un établissement par son identifiant
 *     description: Retourne les informations complètes d'un établissement de santé via son UUID. Accessible aux rôles **admin**, **medecin**, et **patient**.
 *     tags:
 *       - Établissements
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant UUID de l'établissement
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Informations de l'établissement récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleEtablissementResponse'
 *       400:
 *         description: Identifiant invalide ou manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Droits insuffisants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Établissement introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/etablissements/:id",
  requireAuthentication,
  requireRole("admin", "patient", "medecin"),
  validate({ params: etablissementIdSchema }),
  getEtablissementById,
);

export default router;
