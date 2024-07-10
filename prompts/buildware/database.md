# Database Context

## Tech Stack

- Database: Neon PostgreSQL
- ORM: Drizzle

## Project Structure

- `drizzle.config.ts`: Config for Drizzle. Don’t edit this.
- `db/`: DB related code.
  - `db.ts`: Basic DB setup. Don’t edit this.
  - `db/migrations/`: Migrations. Don’t edit this.
  - `db/schema/`: Schema code.
  - `db/queries/`: Query code.

## Schema (`db/schema/`)

- Define each table's schema in `db/schema/[tablename]/index.ts`.
- Export all schemas from `db/schema/index.ts`.

### Schema Example

`db/schema/posts/index.ts`

```ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const postsTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertPost = typeof postsTable.$inferInsert
export type SelectPost = typeof postsTable.$inferSelect
```

## Queries (`db/queries/`)

- Implement queries in `db/queries/[tablename]/index.ts`.
- Sort queries in CRUD order (Create, Read, Update, Delete).
- Export all queries from `db/queries/index.ts`.

### Queries Example

`db/queries/posts/index.ts`

```ts
"use server"

import { db } from "@/db/db"
import { postsTable } from "@/db/schema/posts"
import { eq } from "drizzle-orm"

export const createPost = async (data: InsertPost) => {
  try {
    const result = await db.insert(postsTable).values(data).returning()
    return result[0]
  } catch (error) {
    console.error("Error creating post:", error)
    throw new Error("Failed to create post")
  }
}

export const getPostById = async (id: string): Promise<SelectPost> => {
  try {
    const result = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, id))
      .limit(1)
    return result[0]
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error)
    throw new Error("Failed to fetch post")
  }
}

export const getAllPosts = async (): Promise<SelectPost[]> => {
  try {
    const result = await db.select().from(postsTable)
    return result
  } catch (error) {
    console.error("Error fetching all posts:", error)
    throw new Error("Failed to fetch posts")
  }
}

export const updatePost = async (id: string, data: InsertPost) => {
  try {
    const result = await db
      .update(postsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(postsTable.id, id))
      .returning()
    return result[0]
  } catch (error) {
    console.error(`Error updating post with id ${id}:`, error)
    throw new Error("Failed to update post")
  }
}

export const deletePost = async (id: string): Promise<SelectPost> => {
  try {
    const result = await db
      .delete(postsTable)
      .where(eq(postsTable.id, id))
      .returning()
    return result[0]
  } catch (error) {
    console.error(`Error deleting post with id ${id}:`, error)
    throw new Error("Failed to delete post")
  }
}
```

## Instructions

- Don’t edit `drizzle.config.ts`, `db.ts`, or `db/migrations/`.
- Don’t worry about migrations. The human developer will handle that.
- For most tasks, we'll want full CRUD for each table.
- We generally like `UUIDs` as primary keys. Only override this for special circumstances.
