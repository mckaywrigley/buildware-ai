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
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);