ALTER TABLE "hospital_admin"
ADD COLUMN IF NOT EXISTS "previous_role" text DEFAULT 'patient' NOT NULL;
