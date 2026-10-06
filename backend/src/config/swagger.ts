import swaggerJSDoc from "swagger-jsdoc";

const port = process.env.PORT || 3001;

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "MedTrack API",
      version: "1.0.0",
      description: `
API REST de **MedTrack** - Plateforme de gestion du suivi médical et des établissements de santé.

### Authentification & Rôles
L'API utilise **Better Auth** pour l'authentification et le contrôle d'accès basé sur les rôles (RBAC) :
- **superadmin** : Accès complet à toutes les ressources du système.
- **admin** : Création, modification, consultation et suppression des établissements.
- **medecin** : Consultation des établissements et gestion des patients.
- **patient** : Rôle par défaut, consultation des établissements.

### Modes d'authentification
Vous pouvez vous authentifier via :
1. **Cookie de session** (\`better-auth.session_token\`) déposé automatiquement lors du login.
2. **Bearer Token** dans l'en-tête HTTP : \`Authorization: Bearer <session_token>\`.
      `,
      contact: {
        name: "Support MedTrack",
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Serveur local de développement",
      },
    ],
    tags: [
      {
        name: "Établissements",
        description: "Gestion des établissements de santé (hôpitaux, cliniques, centres de soins)",
      },
      {
        name: "Authentification",
        description: "Endpoints d'authentification et gestion de session (Better Auth)",
      },
      {
        name: "Utilisateurs",
        description: "Gestion des utilisateurs et profil de l'utilisateur connecté",
      },
      {
        name: "Général",
        description: "Endpoints généraux et vérification de disponibilité",
      },
      {
        name: "Développement",
        description: "Endpoints d'aide au développement et tests rapides",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Jeton de session Better Auth transmis dans le header `Authorization: Bearer <token>`",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description: "Cookie de session Better Auth automatiquement géré par le navigateur",
        },
      },
      schemas: {
        Etablissement: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identifiant unique de l'établissement",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              description: "Nom de l'établissement",
              example: "Hôpital Principal de Dakar",
            },
            email: {
              type: "string",
              format: "email",
              description: "Adresse e-mail officielle",
              example: "contact@hopital-principal.sn",
            },
            phone: {
              type: "string",
              description: "Numéro de téléphone de contact",
              example: "+221338395050",
            },
            address: {
              type: "string",
              description: "Adresse physique de l'établissement",
              example: "1 Avenue Nelson Mandela, Dakar, Sénégal",
            },
            logo: {
              type: "string",
              format: "uri",
              nullable: true,
              description: "URL du logo",
              example: "https://example.com/logo.png",
            },
            userId: {
              type: "string",
              description: "Identifiant de l'utilisateur ayant créé l'établissement",
              example: "usr_abc123456",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Date de création de l'enregistrement",
              example: "2026-10-01T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Date de dernière mise à jour de l'enregistrement",
              example: "2026-10-01T10:00:00.000Z",
            },
          },
          required: ["id", "name", "email", "phone", "address", "userId", "createdAt", "updatedAt"],
        },
        CreateEtablissementInput: {
          type: "object",
          required: ["name", "email", "phone", "address"],
          properties: {
            name: {
              type: "string",
              minLength: 3,
              maxLength: 100,
              description: "Nom de l'établissement (3 à 100 caractères, unique)",
              example: "Clinique de la Madeleine",
            },
            email: {
              type: "string",
              format: "email",
              maxLength: 255,
              description: "Adresse e-mail valide de l'établissement (max 255 caractères)",
              example: "contact@madeleine.sn",
            },
            phone: {
              type: "string",
              minLength: 10,
              maxLength: 20,
              description: "Numéro de téléphone de contact (10 à 20 caractères)",
              example: "+221338899470",
            },
            address: {
              type: "string",
              minLength: 5,
              maxLength: 255,
              description: "Adresse complète de l'établissement (5 à 255 caractères)",
              example: "Avenue Pasteur, Dakar",
            },
            logo: {
              type: "string",
              format: "uri",
              nullable: true,
              description: "URL valide menant au logo de l'établissement (optionnel)",
              example: "https://example.com/images/logo.png",
            },
          },
        },
        UpdateEtablissementInput: {
          type: "object",
          description: "Champs modifiables de l'établissement. Au moins un champ doit être fourni.",
          properties: {
            name: {
              type: "string",
              minLength: 3,
              maxLength: 100,
              description: "Nouveau nom de l'établissement",
              example: "Clinique de la Madeleine (Rénovée)",
            },
            email: {
              type: "string",
              format: "email",
              maxLength: 255,
              description: "Nouvelle adresse e-mail",
              example: "support@madeleine.sn",
            },
            phone: {
              type: "string",
              minLength: 10,
              maxLength: 20,
              description: "Nouveau numéro de téléphone",
              example: "+221338899471",
            },
            address: {
              type: "string",
              minLength: 5,
              maxLength: 255,
              description: "Nouvelle adresse physique",
              example: "Avenue Pasteur Plateau, Dakar",
            },
            logo: {
              type: "string",
              format: "uri",
              nullable: true,
              description: "Nouvelle URL du logo",
              example: "https://example.com/images/new-logo.png",
            },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            currentPage: {
              type: "integer",
              description: "Numéro de la page actuelle",
              example: 1,
            },
            perPage: {
              type: "integer",
              description: "Nombre d'éléments par page",
              example: 20,
            },
            totalItems: {
              type: "integer",
              description: "Nombre total d'éléments correspondant aux filtres",
              example: 45,
            },
            totalPages: {
              type: "integer",
              description: "Nombre total de pages disponibles",
              example: 3,
            },
          },
          required: ["currentPage", "perPage", "totalItems", "totalPages"],
        },
        GetEtablissementsResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            etablissements: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Etablissement",
              },
            },
            pagination: {
              $ref: "#/components/schemas/PaginationMeta",
            },
          },
          required: ["success", "etablissements", "pagination"],
        },
        SingleEtablissementResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            etablissement: {
              $ref: "#/components/schemas/Etablissement",
            },
          },
          required: ["success", "etablissement"],
        },
        CreateEtablissementResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Établissement créé avec succès",
            },
            etablissement: {
              $ref: "#/components/schemas/Etablissement",
            },
          },
          required: ["success", "message", "etablissement"],
        },
        UpdateEtablissementResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Établissement mis à jour avec succès",
            },
            etablissement: {
              $ref: "#/components/schemas/Etablissement",
            },
          },
          required: ["success", "message", "etablissement"],
        },
        DeleteEtablissementResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Établissement supprimé avec succès",
            },
          },
          required: ["success", "message"],
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Identifiant unique de l'utilisateur",
              example: "usr_ck87654321",
            },
            name: {
              type: "string",
              description: "Nom complet de l'utilisateur",
              example: "Dr. Amadou Diallo",
            },
            email: {
              type: "string",
              format: "email",
              description: "Adresse e-mail unique",
              example: "amadou.diallo@example.com",
            },
            role: {
              type: "string",
              enum: ["superadmin", "admin", "medecin", "patient"],
              description: "Rôle de l'utilisateur dans l'application",
              example: "admin",
            },
            emailVerified: {
              type: "boolean",
              description: "Indique si l'adresse e-mail a été vérifiée",
              example: false,
            },
            image: {
              type: "string",
              nullable: true,
              description: "URL de la photo de profil",
              example: "https://example.com/avatars/user1.png",
            },
            banned: {
              type: "boolean",
              description: "Indique si l'utilisateur est banni",
              example: false,
            },
            banReason: {
              type: "string",
              nullable: true,
              description: "Raison du bannissement",
              example: null,
            },
            banExpires: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Date d'expiration du bannissement",
              example: null,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-10-01T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-10-01T12:00:00.000Z",
            },
          },
          required: ["id", "name", "email", "emailVerified", "createdAt", "updatedAt"],
        },
        Session: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Identifiant de la session",
              example: "ses_a1b2c3d4e5",
            },
            token: {
              type: "string",
              description: "Jeton de session unique",
              example: "session_token_xyz987",
            },
            userId: {
              type: "string",
              description: "Identifiant de l'utilisateur rattaché à la session",
              example: "usr_ck87654321",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Date et heure d'expiration de la session",
              example: "2026-10-15T12:00:00.000Z",
            },
            ipAddress: {
              type: "string",
              nullable: true,
              description: "Adresse IP du client lors de la création de la session",
              example: "127.0.0.1",
            },
            userAgent: {
              type: "string",
              nullable: true,
              description: "User Agent du navigateur du client",
              example: "Mozilla/5.0 (X11; Linux x86_64)",
            },
            impersonatedBy: {
              type: "string",
              nullable: true,
              description: "Identifiant de l'administrateur ayant usurpé la session, le cas échéant",
              example: null,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-10-01T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-10-01T12:00:00.000Z",
            },
          },
          required: ["id", "token", "userId", "expiresAt", "createdAt", "updatedAt"],
        },
        MeResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            session: {
              $ref: "#/components/schemas/Session",
            },
          },
          required: ["success", "user", "session"],
        },
        SignUpInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              description: "Nom complet du nouvel utilisateur",
              example: "Dr. Amadou Diallo",
            },
            email: {
              type: "string",
              format: "email",
              description: "Adresse e-mail valide",
              example: "amadou.diallo@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 8,
              maxLength: 128,
              description: "Mot de passe (entre 8 et 128 caractères)",
              example: "Password1234!",
            },
            image: {
              type: "string",
              format: "uri",
              description: "URL de la photo de profil (optionnel)",
              example: "https://example.com/avatar.png",
            },
            callbackURL: {
              type: "string",
              description: "URL de redirection après inscription (optionnel)",
              example: "http://localhost:3000/auth/callback",
            },
          },
        },
        SignInInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Adresse e-mail du compte",
              example: "amadou.diallo@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "Mot de passe",
              example: "Password1234!",
            },
            rememberMe: {
              type: "boolean",
              default: true,
              description: "Garder la session active au-delà de la durée standard",
              example: true,
            },
            callbackURL: {
              type: "string",
              description: "URL de redirection après connexion (optionnel)",
              example: "http://localhost:3000/dashboard",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "Jeton de session Better Auth",
              example: "session_token_xyz987",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
          required: ["token", "user"],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Authentification requise.",
            },
          },
          required: ["success", "message"],
        },
        ValidationErrorItem: {
          type: "object",
          properties: {
            field: {
              type: "string",
              description: "Chemin du champ en erreur",
              example: "body.name",
            },
            message: {
              type: "string",
              description: "Message détaillant l'erreur de validation",
              example: "Le nom de l'établissement doit contenir au moins 3 caractères",
            },
          },
          required: ["field", "message"],
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Données invalides",
            },
            errors: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ValidationErrorItem",
              },
            },
          },
          required: ["success", "message", "errors"],
        },
        ConflictErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Un établissement avec ce nom existe déjà.",
            },
            field: {
              type: "string",
              example: "name",
            },
          },
          required: ["success", "message", "field"],
        },
      },
    },
  },
  apis: [
    "./src/router/**/*.ts",
    "./src/server.ts",
    "./src/docs/**/*.ts",
  ],
});
