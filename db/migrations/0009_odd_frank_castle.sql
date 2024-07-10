CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "project_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "project_id" text NOT NULL;