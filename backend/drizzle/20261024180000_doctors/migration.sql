CREATE TABLE IF NOT EXISTS "doctor" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"specialty" varchar(100) NOT NULL,
	"department" varchar(100) NOT NULL,
	"professional_id" varchar(100),
	"phone" varchar(20),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"etablissement_id" text NOT NULL,
	"previous_role" text DEFAULT 'patient' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "doctor_user_id_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "doctor_professional_id_unique" UNIQUE("professional_id"),
	CONSTRAINT "doctor_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
	CONSTRAINT "doctor_etablissement_id_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doctor_etablissementId_idx" ON "doctor" USING btree ("etablissement_id");
