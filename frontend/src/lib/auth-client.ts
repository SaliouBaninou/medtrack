import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

import {
  accessControl,
  superadminRole,
  adminRole,
  patientRole,
  medecinRole,
} from "./permissions";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL,

  plugins: [
    adminClient({
      ac: accessControl,
      roles: {
        superadmin: superadminRole,
        admin: adminRole,
        patient: patientRole,
        medecin: medecinRole,
      },
    }),
  ],
});
