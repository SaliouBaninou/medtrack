import { z } from "zod";

const textField = (label: string, max = 100) => z.string().trim().min(2, `${label} doit contenir au moins 2 caractères.`).max(max, `${label} ne peut pas dépasser ${max} caractères.`);

export const createDoctorSchema = z.object({
  userId: z.string().trim().min(1, "Le compte utilisateur est requis."),
  specialty: textField("La spécialité"),
  department: textField("Le département"),
  professionalId: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().min(8).max(20).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
}).strict();

export const updateDoctorSchema = createDoctorSchema.omit({ userId: true });
export const doctorIdSchema = z.object({ id: z.string().trim().min(1) }).strict();

export const doctorFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(255).optional(),
}).strict();

export const doctorAccountSearchSchema = z.object({
  search: z.string().trim().min(3).max(255),
}).strict();

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type DoctorFilterInput = z.infer<typeof doctorFilterSchema>;
