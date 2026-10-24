import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAccessControl } from "better-auth/plugins/access";
import { admin as adminPlugin } from "better-auth/plugins";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { db } from "../db/index.js";
import schema from "../db/schema.js";
import { emailOTP } from "better-auth/plugins/email-otp";
import { sendMedTrackEmail, sendOtpEmail, sendPasswordResetEmail } from "../resend/email.js";

const statement = {
  ...defaultStatements,
  etablissement: ["create", "read", "update", "delete"],
} as const;

const accessControl = createAccessControl(statement);

export const superadminRole = accessControl.newRole({
  user: [...adminAc.statements.user, "impersonate-admins"],
  session: [...adminAc.statements.session],
  etablissement: ["create", "read", "update", "delete"],
});

export const adminRole = accessControl.newRole({
  user: ["set-role", "ban"],
  etablissement: ["create", "read", "update", "delete"],
});

export const patientRole = accessControl.newRole({
  etablissement: ["read"],
});

export const medecinRole = accessControl.newRole({
  etablissement: ["read"],
});

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendMedTrackEmail({
        to: user.email,
        subject: "Confirmez votre adresse e-mail MedTrack",
        heading: "Confirmez votre adresse e-mail",
        intro: "Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail.",
        actionLabel: "Confirmer mon adresse",
        actionUrl: url,
        expiry: "Si vous n’avez pas créé de compte MedTrack, ignorez cet e-mail.",
      });
    },
    sendOnSignUp: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: ["http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, url });
    },
    revokeSessionsOnPasswordReset: true,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 3,
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: sendOtpEmail,
    }),
    adminPlugin({
      ac: accessControl,
      roles: {
        superadmin: superadminRole,
        admin: adminRole,
        patient: patientRole,
        medecin: medecinRole,
      },
      adminRoles: ["superadmin"],
      defaultRole: "patient",
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
