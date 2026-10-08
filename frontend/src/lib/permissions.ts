import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
} from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  etablissement: ["create", "read", "update", "delete"],
} as const;

export const accessControl = createAccessControl(statement);

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
