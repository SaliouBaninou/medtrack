CREATE TABLE "patient" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"place_of_birth" varchar(255) NOT NULL,
	"residence" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"situation" varchar(20) NOT NULL,
	"profession" varchar(100) NOT NULL,
	"gender" varchar(20) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "patient_user_id_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "patient_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX "patient_userId_idx" ON "patient" USING btree ("user_id");
