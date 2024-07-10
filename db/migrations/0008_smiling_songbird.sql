ALTER TABLE "templatePrompts" RENAME TO "templates_to_prompts";--> statement-breakpoint
ALTER TABLE "templates_to_prompts" DROP CONSTRAINT "templatePrompts_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "templates_to_prompts" DROP CONSTRAINT "templatePrompts_prompt_id_prompts_id_fk";
--> statement-breakpoint
ALTER TABLE "templates_to_prompts" ADD CONSTRAINT "templates_to_prompts_template_id_prompt_id_pk" PRIMARY KEY("template_id","prompt_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates_to_prompts" ADD CONSTRAINT "templates_to_prompts_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates_to_prompts" ADD CONSTRAINT "templates_to_prompts_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
