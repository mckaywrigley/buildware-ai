CREATE TABLE IF NOT EXISTS "context_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "context_groups_to_embedded_files" (
	"context_group_id" uuid NOT NULL,
	"embedded_file_id" uuid NOT NULL,
	CONSTRAINT "context_groups_to_embedded_files_context_group_id_embedded_file_id_pk" PRIMARY KEY("context_group_id","embedded_file_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues_to_context_groups" (
	"issue_id" uuid NOT NULL,
	"context_group_id" uuid NOT NULL,
	CONSTRAINT "issues_to_context_groups_issue_id_context_group_id_pk" PRIMARY KEY("issue_id","context_group_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "context_groups" ADD CONSTRAINT "context_groups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "context_groups_to_embedded_files" ADD CONSTRAINT "context_groups_to_embedded_files_context_group_id_context_groups_id_fk" FOREIGN KEY ("context_group_id") REFERENCES "public"."context_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "context_groups_to_embedded_files" ADD CONSTRAINT "context_groups_to_embedded_files_embedded_file_id_embedded_files_id_fk" FOREIGN KEY ("embedded_file_id") REFERENCES "public"."embedded_files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_to_context_groups" ADD CONSTRAINT "issues_to_context_groups_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_to_context_groups" ADD CONSTRAINT "issues_to_context_groups_context_group_id_context_groups_id_fk" FOREIGN KEY ("context_group_id") REFERENCES "public"."context_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
