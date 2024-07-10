-- First, update any NULL values to a default integer (e.g., 0)
UPDATE "projects" SET "github_installation_id" = '0' WHERE "github_installation_id" IS NULL;

-- Then, remove any non-numeric characters from the column
UPDATE "projects" SET "github_installation_id" = regexp_replace("github_installation_id", '\D', '', 'g');

-- Now, alter the column type to integer
ALTER TABLE "projects" ALTER COLUMN "github_installation_id" TYPE integer USING ("github_installation_id"::integer);
