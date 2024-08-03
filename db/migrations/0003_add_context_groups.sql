-- Create context_groups table
CREATE TABLE IF NOT EXISTS "context_groups" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create context_group_files table
CREATE TABLE IF NOT EXISTS "context_group_files" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "context_group_id" UUID NOT NULL REFERENCES "context_groups"("id") ON DELETE CASCADE,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_context_groups_user_id" ON "context_groups" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_context_groups_project_id" ON "context_groups" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_context_group_files_context_group_id" ON "context_group_files" ("context_group_id");

-- Add unique constraint to prevent duplicate file paths in a context group
ALTER TABLE "context_group_files" ADD CONSTRAINT "unique_file_path_per_group" UNIQUE ("context_group_id", "file_path");