CREATE TABLE "hospital_admin" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"etablissement_id" text NOT NULL,
	"profession" varchar(50) NOT NULL,
	"telephone" varchar(15) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "hospital_admin_user_id_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "hospital_admin_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
	CONSTRAINT "hospital_admin_etablissement_id_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX "hospital_admin_etablissementId_idx" ON "hospital_admin" USING btree ("etablissement_id");
