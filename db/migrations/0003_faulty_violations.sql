ALTER TABLE "profiles" ADD COLUMN "linear_access_token" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "linear_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "linear_metadata" jsonb;