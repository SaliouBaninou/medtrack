import { Router } from "express";
import { requireAuthentication, requireRole } from "../middleware/authentication.js";
import { validate } from "../utils/schema-validator.js";
import { adminUserSearchSchema, createAdminSchema, hospitalAdminFilterSchema, hospitalAdminIdParamsSchema, updateAdminSchema } from "../zod-schema/hospital-admins.js";
import { banAdmin, createHospitalAdmin, deleteAdmin, getAdminsByHospital, searchAdminUsers, unbanAdmin, updateAdmin } from "../controllers/hospital-admins.controller.js";

const router = Router();

router.get(
  "/hospital-admins/users",
  requireAuthentication,
  requireRole("superadmin"),
  validate({ query: adminUserSearchSchema }),
  searchAdminUsers,
);

router.get(
  "/hospital-admins",
  requireAuthentication,
  requireRole("superadmin"),
  validate({ query: hospitalAdminFilterSchema }),
  getAdminsByHospital,
);

/**
 * @openapi
 * /api/hospital-admins:
 *   post:
 *     summary: Créer un administrateur d'établissement
 *     description: Associe un compte existant à un établissement, crée son profil et lui attribue le rôle admin. Réservé au superadmin.
 *     tags: [Administrateurs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHospitalAdminInput'
 *     responses:
 *       201:
 *         description: Administrateur créé
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Accès réservé au superadmin
 *       404:
 *         description: Compte utilisateur ou établissement introuvable
 *       409:
 *         description: Un profil administrateur existe déjà pour ce compte
 *       500:
 *         description: Erreur interne du serveur
 */
router.post(
  "/hospital-admins",
  requireAuthentication,
  requireRole("superadmin"),
  validate({ body: createAdminSchema }),
  createHospitalAdmin,
);

router.put(
  "/hospital-admins/:id",
  requireAuthentication,
  requireRole("superadmin"),
  validate({ params: hospitalAdminIdParamsSchema, body: updateAdminSchema }),
  updateAdmin,
);

router.post(
  "/hospital-admins/:id/ban",
  requireAuthentication,
  requireRole("superadmin"),
  validate({ params: hospitalAdminIdParamsSchema }),
  banAdmin,
);

router.post(
  "/hospital-admins/:id/unban",
  requireAuthentication,
  requireRole("superadmin"),
  validate({ params: hospitalAdminIdParamsSchema }),
  unbanAdmin,
);

router.delete(
  "/hospital-admins/:id",
  requireAuthentication,
  requireRole("superadmin"),
  validate({ params: hospitalAdminIdParamsSchema }),
  deleteAdmin,
);

export default router
