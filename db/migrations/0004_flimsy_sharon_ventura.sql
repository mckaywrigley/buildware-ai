ALTER TABLE "prompts" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_user_id_unique" UNIQUE("user_id");