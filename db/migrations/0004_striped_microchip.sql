ALTER TABLE "context_groups" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "context_groups" ADD COLUMN "project_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "context_groups" ADD CONSTRAINT "context_groups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
