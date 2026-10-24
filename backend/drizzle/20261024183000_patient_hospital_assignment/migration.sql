ALTER TABLE "patient"
ADD COLUMN IF NOT EXISTS "etablissement_id" text REFERENCES "etablissement"("id") ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patient_etablissementId_idx" ON "patient" USING btree ("etablissement_id");
