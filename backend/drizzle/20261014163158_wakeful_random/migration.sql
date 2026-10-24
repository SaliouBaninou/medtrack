CREATE TABLE "patient" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"date_of_birth" date NOT NULL,
	"place_of_birth" varchar(255) NOT NULL,
	"residence" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"situation" varchar(20) NOT NULL,
	"profession" varchar(100) NOT NULL,
	"gender" varchar(20) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "patient_userId_idx" ON "patient" ("user_id");--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;