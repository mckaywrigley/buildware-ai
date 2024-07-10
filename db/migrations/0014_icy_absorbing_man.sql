ALTER TABLE "profiles" ADD COLUMN "has_onboarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_repo" text;