ALTER TABLE "projects" RENAME COLUMN "github_repo" TO "github_repo_full_name";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "linear_user_id" TO "linear_organization_id";--> statement-breakpoint
ALTER TABLE "embedded_branches" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "embedded_files" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "github_user_id";