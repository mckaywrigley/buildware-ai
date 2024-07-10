CREATE TABLE IF NOT EXISTS "embedded_branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"github_repo_full_name" text NOT NULL,
	"branch_name" text NOT NULL,
	"is_updated" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "code_embeddings" RENAME TO "embedded_files";--> statement-breakpoint
ALTER TABLE "embedded_files" RENAME COLUMN "github_repo_id" TO "github_repo_full_name";--> statement-breakpoint
ALTER TABLE "embedded_files" DROP CONSTRAINT "code_embeddings_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "embedded_files" ALTER COLUMN "github_repo_full_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "embedded_files" ADD COLUMN "embedded_branch_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "embedded_branches" ADD CONSTRAINT "embedded_branches_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "embedded_files" ADD CONSTRAINT "embedded_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "embedded_files" ADD CONSTRAINT "embedded_files_embedded_branch_id_embedded_branches_id_fk" FOREIGN KEY ("embedded_branch_id") REFERENCES "public"."embedded_branches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "embedded_files" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "embedded_files" DROP COLUMN IF EXISTS "extension";--> statement-breakpoint
ALTER TABLE "embedded_files" DROP COLUMN IF EXISTS "content";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "github_access_token";