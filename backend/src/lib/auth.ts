import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAccessControl } from "better-auth/plugins/access";
import { admin as adminPlugin } from "better-auth/plugins";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { db } from "../db/index.js";
import schema from "../db/schema.js";

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
  etablissement: ["create", "read", "update", "delete"],
});

export const patientRole = accessControl.newRole({
  etablissement: ["read"],
});

export const medecinRole = accessControl.newRole({
  etablissement: ["read"],
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
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
