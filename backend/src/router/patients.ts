import { Router } from "express";
import { requireAuthentication, requireRole } from "../middleware/authentication.js";
import { validate } from "../utils/schema-validator.js";
import {
  createPatientSchema,
  patientFilterSchema,
  patientIdSchema,
  updatePatientSchema,
  unassignedPatientSearchSchema,
} from "../zod-schema/patients.js";
import {
  createPatient,
  deletePatient,
  getMyPatient,
  getPatient,
  getPatients,
  updatePatient,
  getUnassignedPatients,
  assignPatientToHospital,
  banPatient,
  unbanPatient,
} from "../controllers/patient-controller.js";

const router = Router();

/**
 * @openapi
 * /api/patients:
 *   post:
 *     summary: Créer le profil patient du compte connecté
 *     description: Un compte avec le rôle patient peut créer un seul profil. Les données de compte (nom et e-mail) restent gérées par Better Auth.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePatientInput'
 *     responses:
 *       201:
 *         description: Profil patient créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PatientMutationResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Le rôle patient est requis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Un profil existe déjà pour ce compte
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
router.post("/patients", requireAuthentication, requireRole("patient"), validate({ body: createPatientSchema }), createPatient);

/**
 * @openapi
 * /api/patients/me:
 *   get:
 *     summary: Récupérer le profil patient du compte connecté
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profil patient récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SinglePatientResponse'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Le rôle patient est requis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Aucun profil patient associé au compte
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
router.get("/patients/me", requireAuthentication, requireRole("patient"), getMyPatient);

router.get("/patients/unassigned", requireAuthentication, requireRole("admin"), validate({ query: unassignedPatientSearchSchema }), getUnassignedPatients);

/**
 * @openapi
 * /api/patients:
 *   get:
 *     summary: Lister les profils patients
 *     description: Accessible aux rôles admin et medecin. La recherche porte sur le nom, l'e-mail, le téléphone et la résidence.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *         description: Nombre de résultats par page
 *       - in: query
 *         name: search
 *         schema: { type: string, maxLength: 255 }
 *         description: Recherche dans le nom, l'e-mail, le téléphone et la résidence
 *     responses:
 *       200:
 *         description: Liste paginée récupérée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetPatientsResponse'
 *       400:
 *         description: Paramètres de recherche invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Rôle admin ou medecin requis
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
router.get("/patients", requireAuthentication, requireRole("admin", "medecin"), validate({ query: patientFilterSchema }), getPatients);

/**
 * @openapi
 * /api/patients/{id}:
 *   get:
 *     summary: Récupérer un profil patient par son identifiant
 *     description: Un patient ne peut consulter que son propre profil. Les rôles medecin et admin peuvent consulter tous les profils.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Identifiant du profil patient
 *     responses:
 *       200:
 *         description: Profil récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SinglePatientResponse'
 *       400:
 *         description: Identifiant invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès interdit à ce profil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient introuvable
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
 *   put:
 *     summary: Modifier un profil patient
 *     description: Un patient peut modifier son propre profil ; un admin peut modifier tous les profils. Au moins un champ doit être fourni.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Identifiant du profil patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePatientInput'
 *     responses:
 *       200:
 *         description: Profil patient mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PatientMutationResponse'
 *       400:
 *         description: Identifiant ou données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès interdit à ce profil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient introuvable
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
 *   delete:
 *     summary: Supprimer un profil patient
 *     description: Opération réservée aux rôles admin et superadmin. Le compte utilisateur associé n'est pas supprimé.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Identifiant du profil patient
 *     responses:
 *       200:
 *         description: Profil patient supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeletePatientResponse'
 *       400:
 *         description: Identifiant invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Rôle admin requis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient introuvable
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
router.post("/patients/:id/assign", requireAuthentication, requireRole("admin"), validate({ params: patientIdSchema }), assignPatientToHospital);
router.post("/patients/:id/ban", requireAuthentication, requireRole("admin"), validate({ params: patientIdSchema }), banPatient);
router.post("/patients/:id/unban", requireAuthentication, requireRole("admin"), validate({ params: patientIdSchema }), unbanPatient);
router.get("/patients/:id", requireAuthentication, requireRole("patient", "admin", "medecin"), validate({ params: patientIdSchema }), getPatient);
router.put("/patients/:id", requireAuthentication, requireRole("patient", "admin"), validate({ params: patientIdSchema, body: updatePatientSchema }), updatePatient);
router.delete("/patients/:id", requireAuthentication, requireRole("admin"), validate({ params: patientIdSchema }), deletePatient);

export default router;
