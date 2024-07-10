CREATE TABLE IF NOT EXISTS "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" text NOT NULL,
	"template_id" text NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'ready' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
