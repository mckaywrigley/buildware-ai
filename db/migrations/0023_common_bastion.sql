CREATE TABLE IF NOT EXISTS "issues_to_prompts" (
	"issue_id" uuid NOT NULL,
	"prompt_id" uuid NOT NULL,
	CONSTRAINT "issues_to_prompts_issue_id_prompt_id_pk" PRIMARY KEY("issue_id","prompt_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_to_prompts" ADD CONSTRAINT "issues_to_prompts_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_to_prompts" ADD CONSTRAINT "issues_to_prompts_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
