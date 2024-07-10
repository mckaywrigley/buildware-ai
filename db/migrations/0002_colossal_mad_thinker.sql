CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"github_installation_id" text,
	"github_access_token" text,
	"github_token_expires_at" timestamp,
	"github_metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
