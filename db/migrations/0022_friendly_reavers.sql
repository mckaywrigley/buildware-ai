ALTER TABLE "issues" DROP CONSTRAINT "issues_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN IF EXISTS "template_id";