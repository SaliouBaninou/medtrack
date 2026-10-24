import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  varchar,
  date,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers.js";
import { randomUUID } from "node:crypto";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Others tables

export const etablissement = pgTable("etablissement", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  logo: text("logo").$default(() => "https://via.placeholder.com/150"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

/** Profil d'administration rattaché à un compte et à un établissement. */
export const hospitalAdmin = pgTable(
  "hospital_admin",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    etablissementId: text("etablissement_id")
      .notNull()
      .references(() => etablissement.id, { onDelete: "cascade" }),
    profession: varchar("profession", { length: 50 }).notNull(),
    telephone: varchar("telephone", { length: 15 }).notNull(),
    previousRole: text("previous_role").notNull().default("patient"),
    ...timestamps,
  },
  (table) => [index("hospital_admin_etablissementId_idx").on(table.etablissementId)],
);

/** Profil médical rattaché à un compte Better Auth et à son établissement. */
export const doctor = pgTable(
  "doctor",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    specialty: varchar("specialty", { length: 100 }).notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    professionalId: varchar("professional_id", { length: 100 }).unique(),
    phone: varchar("phone", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    etablissementId: text("etablissement_id")
      .notNull()
      .references(() => etablissement.id, { onDelete: "cascade" }),
    previousRole: text("previous_role").notNull().default("patient"),
    ...timestamps,
  },
  (table) => [index("doctor_etablissementId_idx").on(table.etablissementId)],
);

/** Profil complémentaire rattaché à un compte Better Auth. */
export const patient = pgTable(
  "patient",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
    placeOfBirth: varchar("place_of_birth", { length: 255 }).notNull(),
    residence: varchar("residence", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    situation: varchar("situation", { length: 20 }).notNull(),
    profession: varchar("profession", { length: 100 }).notNull(),
    gender: varchar("gender", { length: 20 }).notNull(),
    etablissementId: text("etablissement_id").references(() => etablissement.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [
    index("patient_userId_idx").on(table.userId),
    index("patient_etablissementId_idx").on(table.etablissementId),
  ],
);

// Export the schema as a default export

export default {
  user,
  session,
  account,
  verification,
  etablissement,
  hospitalAdmin,
  doctor,
  patient,
};
