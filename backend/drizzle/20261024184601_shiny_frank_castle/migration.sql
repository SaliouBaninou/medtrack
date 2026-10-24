CREATE TABLE "doctor" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"specialty" varchar(100) NOT NULL,
	"department" varchar(100) NOT NULL,
	"professional_id" varchar(100) UNIQUE,
	"phone" varchar(20),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"etablissement_id" text NOT NULL,
	"previous_role" text DEFAULT 'patient' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "hospital_admin" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"etablissement_id" text NOT NULL,
	"profession" varchar(50) NOT NULL,
	"telephone" varchar(15) NOT NULL,
	"previous_role" text DEFAULT 'patient' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "doctor_etablissementId_idx" ON "doctor" ("etablissement_id");--> statement-breakpoint
CREATE INDEX "hospital_admin_etablissementId_idx" ON "hospital_admin" ("etablissement_id");--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_etablissement_id_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "hospital_admin" ADD CONSTRAINT "hospital_admin_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "hospital_admin" ADD CONSTRAINT "hospital_admin_etablissement_id_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id") ON DELETE CASCADE;