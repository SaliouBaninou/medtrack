import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { requireAuthentication } from "./middleware/authentication.js";
import { auth } from "./lib/auth.js";
import routes from "./router/index.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
    customSiteTitle: "MedTrack API - Swagger Docs",
  }),
);

app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());
app.use("/api", routes);

/**
 * @openapi
 * /fake-user:
 *   get:
 *     summary: Créer un compte fictif de test
 *     description: Endpoint de développement pour provisionner rapidement l'utilisateur de test `john.doe@example.com` avec le mot de passe `password1234`.
 *     tags:
 *       - Développement
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       500:
 *         description: Erreur de création ou utilisateur existant
 */
app.get("/fake-user", async (req, res) => {
  try {
    const data = await auth.api.signUpEmail({
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password1234",
        image: "https://example.com/image.png",
        callbackURL: "https://example.com/callback",
      },
    });
    return res.status(201).json(data);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /fake-login:
 *   get:
 *     summary: Connexion rapide avec le compte fictif
 *     description: Endpoint de développement pour obtenir une session active avec `john.doe@example.com`.
 *     tags:
 *       - Développement
 *     responses:
 *       200:
 *         description: Connexion réussie et session renvoyée
 *       500:
 *         description: Erreur de connexion
 */
app.get("/fake-login", async (req, res) => {
  try {
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    const data = await auth.api.signInEmail({
      body: {
        email: "john.doe@example.com",
        password: "password1234",
        rememberMe: true,
        callbackURL: "https://example.com/callback",
      },
      headers,
    });

    res.json(data);
  } catch (err) {
    const error = err as Error;

    res.status(500).json({
      message: error.message,
    });
  }
});

/**
 * @openapi
 * /api/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté et sa session
 *     description: Retourne l'utilisateur authentifié (identifiant, email, nom, rôle) ainsi que les détails de la session active.
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Informations du compte et de la session récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeResponse'
 *       401:
 *         description: Non authentifié ou session invalide / expirée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get("/api/me", requireAuthentication, (req, res) => {
  return res.json({
    success: true,
    user: res.locals.user,
    session: res.locals.session,
  });
});

app.listen(port, () => {
  console.log(`Server: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
});
