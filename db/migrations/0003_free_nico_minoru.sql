CREATE TABLE IF NOT EXISTS "context_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "context_groups_to_embedded_files" (
	"context_group_id" uuid NOT NULL,
	"embedded_file_id" uuid NOT NULL,
	CONSTRAINT "context_groups_to_embedded_files_context_group_id_embedded_file_id_pk" PRIMARY KEY("context_group_id","embedded_file_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "context_groups_to_embedded_files" ADD CONSTRAINT "context_groups_to_embedded_files_context_group_id_context_groups_id_fk" FOREIGN KEY ("context_group_id") REFERENCES "public"."context_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "context_groups_to_embedded_files" ADD CONSTRAINT "context_groups_to_embedded_files_embedded_file_id_embedded_files_id_fk" FOREIGN KEY ("embedded_file_id") REFERENCES "public"."embedded_files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
