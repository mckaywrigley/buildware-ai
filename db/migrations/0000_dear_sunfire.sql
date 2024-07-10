CREATE EXTENSION vector;

CREATE TABLE IF NOT EXISTS "codebase_retrieval" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"name" text NOT NULL,
	"extension" text NOT NULL,
	"content" text NOT NULL,
	"token_count" integer NOT NULL,
	"embedding" vector(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embedding_index" ON "codebase_retrieval" USING hnsw (embedding vector_cosine_ops);