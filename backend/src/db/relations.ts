import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.js";

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),

    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),

    etablissements: r.many.etablissement({
      from: r.user.id,
      to: r.etablissement.userId,
    }),

    patient: r.one.patient({
      from: r.user.id,
      to: r.patient.userId,
    }),

    hospitalAdmin: r.one.hospitalAdmin({
      from: r.user.id,
      to: r.hospitalAdmin.userId,
    }),

    doctor: r.one.doctor({
      from: r.user.id,
      to: r.doctor.userId,
    }),
  },

  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },

  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },

  etablissement: {
    user: r.one.user({
      from: r.etablissement.userId,
      to: r.user.id,
    }),
    hospitalAdmins: r.many.hospitalAdmin({
      from: r.etablissement.id,
      to: r.hospitalAdmin.etablissementId,
    }),
    doctors: r.many.doctor({
      from: r.etablissement.id,
      to: r.doctor.etablissementId,
    }),
    patients: r.many.patient({
      from: r.etablissement.id,
      to: r.patient.etablissementId,
    }),
  },

  hospitalAdmin: {
    user: r.one.user({
      from: r.hospitalAdmin.userId,
      to: r.user.id,
    }),
    etablissement: r.one.etablissement({
      from: r.hospitalAdmin.etablissementId,
      to: r.etablissement.id,
    }),
  },

  doctor: {
    user: r.one.user({
      from: r.doctor.userId,
      to: r.user.id,
    }),
    etablissement: r.one.etablissement({
      from: r.doctor.etablissementId,
      to: r.etablissement.id,
    }),
  },

  patient: {
    user: r.one.user({
      from: r.patient.userId,
      to: r.user.id,
    }),
    etablissement: r.one.etablissement({
      from: r.patient.etablissementId,
      to: r.etablissement.id,
    }),
  },
}));
