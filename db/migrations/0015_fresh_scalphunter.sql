ALTER TABLE "codebase_retrieval" RENAME TO "code_embeddings";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_unique";--> statement-breakpoint
ALTER TABLE "templates_to_prompts" DROP CONSTRAINT "templates_to_prompts_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "templates_to_prompts" DROP CONSTRAINT "templates_to_prompts_prompt_id_prompts_id_fk";
--> statement-breakpoint
-- Add these lines to drop the existing primary key (if any) and add the new one:
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE "profiles" ADD PRIMARY KEY ("user_id");
--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "project_id" SET DATA TYPE uuid USING (project_id::uuid);--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "project_id" SET DATA TYPE uuid USING (project_id::uuid);--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "project_id" SET DATA TYPE uuid USING (project_id::uuid);--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "template_id" SET DATA TYPE uuid USING (template_id::uuid);--> statement-breakpoint
ALTER TABLE "code_embeddings" ADD COLUMN "project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "code_embeddings" ADD COLUMN "github_repo_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_user_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_installation_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "linear_access_token" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "linear_user_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_access_token" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "code_embeddings" ADD CONSTRAINT "code_embeddings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prompts" ADD CONSTRAINT "prompts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates" ADD CONSTRAINT "templates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates_to_prompts" ADD CONSTRAINT "templates_to_prompts_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates_to_prompts" ADD CONSTRAINT "templates_to_prompts_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "has_onboarded";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "github_installation_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "github_access_token";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "github_token_expires_at";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "github_user_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "github_username";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "github_metadata";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "linear_user_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "linear_access_token";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "linear_token_expires_at";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "linear_metadata";