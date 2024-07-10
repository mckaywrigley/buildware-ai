ALTER TABLE "templatesToPrompts" RENAME TO "templatePrompts";--> statement-breakpoint
ALTER TABLE "templatePrompts" DROP CONSTRAINT "templatesToPrompts_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "templatePrompts" DROP CONSTRAINT "templatesToPrompts_prompt_id_prompts_id_fk";
--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templatePrompts" ADD CONSTRAINT "templatePrompts_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templatePrompts" ADD CONSTRAINT "templatePrompts_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
