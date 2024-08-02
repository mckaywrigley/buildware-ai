CREATE TABLE IF NOT EXISTS "issues_to_context_groups" (
	"issue_id" uuid NOT NULL,
	"context_group_id" uuid NOT NULL,
	CONSTRAINT "issues_to_context_groups_issue_id_context_group_id_pk" PRIMARY KEY("issue_id","context_group_id")
);
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
