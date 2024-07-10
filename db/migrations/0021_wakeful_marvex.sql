CREATE TABLE IF NOT EXISTS "linear_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" text NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL
);
