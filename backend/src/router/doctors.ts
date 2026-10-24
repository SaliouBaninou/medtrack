import { Router } from "express";
import { z } from "zod";
import { requireAuthentication, requireRole } from "../middleware/authentication.js";
import { validate } from "../utils/schema-validator.js";
import { createDoctorSchema, doctorAccountSearchSchema, doctorFilterSchema, doctorIdSchema, updateDoctorSchema } from "../zod-schema/doctors.js";
import { createDoctor, deleteDoctor, getDoctors, searchDoctorAccounts, setDoctorBan, updateDoctor } from "../controllers/doctors-controller.js";

const router = Router();

router.get(
  "/doctors/users",
  requireAuthentication,
  requireRole("admin"),
  validate({ query: doctorAccountSearchSchema }),
  searchDoctorAccounts,
);

router.get(
  "/doctors",
  requireAuthentication,
  requireRole("admin"),
  validate({ query: doctorFilterSchema }),
  getDoctors,
);

router.post(
  "/doctors",
  requireAuthentication,
  requireRole("admin"),
  validate({ body: createDoctorSchema }),
  createDoctor,
);

router.put("/doctors/:id", requireAuthentication, requireRole("admin"), validate({ params: doctorIdSchema, body: updateDoctorSchema }), updateDoctor);
router.patch("/doctors/:id/ban", requireAuthentication, requireRole("admin"), validate({ params: doctorIdSchema, body: z.object({ banned: z.boolean() }).strict() }), setDoctorBan);
router.delete("/doctors/:id", requireAuthentication, requireRole("admin"), validate({ params: doctorIdSchema }), deleteDoctor);

export default router;
