/**
 * @openapi
 * /api/auth/sign-up/email:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Crée un nouveau compte utilisateur avec un email et un mot de passe. Attribue le rôle par défaut 'patient'.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpInput'
 *     responses:
 *       200:
 *         description: Inscription réussie, session créée et cookie déposé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Requête invalide (email déjà pris ou données non conformes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/auth/sign-in/email:
 *   post:
 *     summary: Connexion par email et mot de passe
 *     description: Authentifie un utilisateur existant avec ses identifiants. Renvoie le token de session et configure le cookie `better-auth.session_token`.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignInInput'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données d'entrée invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/auth/sign-out:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     description: Invalide la session active et supprime le cookie d'authentification.
 *     tags:
 *       - Authentification
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion effectuée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 * /api/auth/get-session:
 *   get:
 *     summary: Obtenir la session courante Better Auth
 *     description: Vérifie la validité de la session transmise par cookie ou en-tête Authorization.
 *     tags:
 *       - Authentification
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session active récupérée (ou null si aucune session)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               nullable: true
 *               properties:
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
