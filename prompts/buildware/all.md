# Best Coding Practices Context

## General Principles

- Write clean, readable, and maintainable code.
- Follow the DRY (Don't Repeat Yourself) principle to avoid code duplication.
- Single Responsibility Principle: Each component, function, or module should have a single responsibility.
- Use consistent coding style and formatting throughout the project.
- Write self-documenting code with clear and descriptive names.

## Naming Conventions

- Use descriptive and meaningful names for variables, functions, and classes.
- Follow camelCase for variables and functions, PascalCase for classes and components.
- Use ALL_CAPS for constants and configuration values.
- Prefix boolean variables with "is", "has", or "should" (e.g., isLoading, hasError).
- Use verb phrases for function names (e.g., getUserData, validateInput).

## Functions and Methods

- Keep functions small and focused on a single responsibility.
- Limit the number of parameters for functions when possible.
- Use default parameters instead of conditionals where applicable.
- Avoid side effects in functions when possible.
- Return early from functions to avoid deep nesting.

## Error Handling and Logging

- Implement proper error handling in all API routes and async functions.
- Use try-catch blocks for error handling in async/await code.
- Log errors with sufficient context for debugging.
- Never log sensitive data (e.g., passwords, API keys).

## Security

- Never store secrets or credentials in the code; use environment variables.
- Implement proper authentication and authorization mechanisms.

## Code Organization and Structure

- Follow a consistent and logical folder structure.
- Group related functionality together (e.g., components, hooks, utils).
- Use index files to simplify imports.

# Framework Context

## Tech Stack

- Next.js 14 App Router

## Project Structure

- `next.config.mjs`: Config for Next.js
- `app/`: App
  - `app/api/`: API
  - `app/route/`: Routes
  - `app/[...slug]/`: Slug Routes

## Instructions

- Use server actions (`app/lib/actions/`) instead of API routes (`app/api/`) when possible.
- Fetch data with server components when possible.
- Client components require `use client` at the top of the file when using client-side things like interactivite, state, and hooks
- Implement proper error handling and loading states for better UX.
- Follow Next.js best practices for routing, data fetching, and rendering.
- Keep components small and focused for better maintainability.
- Use TypeScript for improved type safety and developer experience.
- Use functional components and hooks instead of class components.
- Keep components small and focused on a single responsibility.
- Use server components for data fetching.
- Implement proper loading and error states for async operations.
- Extend HTML elements where possible in custom components (`interface ComponentProps extends HTMLAttributes<HTMLDivElement> {}`).
- All components should have TypeScript interfaces (`FC<ComponentProps>`).
- Use React's built-in state management (useState, useReducer) for local state.
- Implement context (useContext) for global state when necessary.

# Design Context

## Tech Stack

- Styling: Tailwind CSS
- Animations: Framer Motion

## Project Structure

- `tailwind.config.js`: Config for Tailwind.
- `app/globals.css`: Global CSS file.

## Tailwind CSS

- Use Tailwind CSS to style the app.

## Framer Motion

- Use Framer Motion to animate the app.

## Responsive Design

- Design should be responsive to different screen sizes.
- Always support both mobile and desktop views.
- Use responsive prefixes (sm:, md:, lg:, xl:, 2xl:) to apply styles at specific breakpoints.

## Design Principles

- User-Centered Design: Always prioritize the needs, preferences, and goals of the end-user.
- Consistency: Maintain a consistent look, feel, behavior, and terminology throughout the app.
- Simplicity: Keep designs clean and uncluttered, focusing on essential elements and reducing cognitive load.
- Visual Hierarchy: Guide users' attention to the most important elements using size, color, contrast, and positioning.
- Responsive and Adaptive Design: Ensure the design adapts seamlessly to different screen sizes, devices, and platforms.
- Intuitive Navigation: Create clear, logical, and easily discoverable navigation paths throughout the app.
- Feedback and Affordance: Provide clear visual and tactile feedback for user actions and make interactive elements obvious.
- White Space: Use negative space effectively to create balance, focus, and improve readability.
- Color Theory and Accessibility: Use colors intentionally to evoke specific emotions, guide user behavior, and ensure sufficient contrast for accessibility.
- Typography: Use font sizes, weights, styles, and pairings to create clear content hierarchy and enhance readability.
- Micro-interactions and Animation: Incorporate subtle animations and transitions to enhance user experience and provide visual cues.
- Contextual Help and Progressive Disclosure: Provide helpful information and guidance where users need it most, revealing complex features gradually.
- Gestalt Principles: Apply principles of visual perception to create cohesive and easily understandable designs.
- Gamification Elements: Incorporate game-like elements to increase user engagement and motivation where suitable.

# Components Context

## Tech Stack

- Shadcn
- Magic UI
- Aceternity

## Project Structure

- `components.json`: Config for Shadcn
- `components/`: All components
  - `components/[category]/`: Components for a specific category (Ex: `components/dashboard/`)
  - `components/ui/`: Shadcn components
  - `components/magicui/`: Magic UI components
  - `components/aceternity/`: Aceternity components

## Components

### Category

### Shadcn

### Magic UI

### Aceternity

## Instructions

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

```ts
// db/schema/posts/index.ts --> Don't include pathname in the actual code.

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const postsTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})
```

## Queries (`db/queries/`)

- Implement queries in `db/queries/[tablename]/index.ts`.
- Sort queries in CRUD order (Create, Read, Update, Delete).
- Export all queries from `db/queries/index.ts`.

### Queries Example

```ts
// db/queries/posts/index.ts --> Don't include pathname in the actual code.

"use server"

import { db } from "@/db/db"
import { postsTable } from "@/db/schema/posts"
import { eq } from "drizzle-orm"

export const createPost = async (title: string, body: string) => {
  try {
    return await db.insert(postsTable).values({ title, body }).returning()
  } catch (error) {
    console.error("Error creating post:", error)
    throw new Error("Failed to create post")
  }
}

export const getPostById = async (id: string) => {
  try {
    return await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, id))
      .limit(1)
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error)
    throw new Error("Failed to fetch post")
  }
}

export const getAllPosts = async () => {
  try {
    return await db.select().from(postsTable)
  } catch (error) {
    console.error("Error fetching all posts:", error)
    throw new Error("Failed to fetch posts")
  }
}

export const updatePost = async (id: string, title: string, body: string) => {
  try {
    return await db
      .update(postsTable)
      .set({ title, body, updatedAt: new Date() })
      .where(eq(postsTable.id, id))
      .returning()
  } catch (error) {
    console.error(`Error updating post with id ${id}:`, error)
    throw new Error("Failed to update post")
  }
}

export const deletePost = async (id: string) => {
  try {
    return await db.delete(postsTable).where(eq(postsTable.id, id)).returning()
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

# Auth Context

## Tech Stack

- Clerk

## Project Structure

- `app/(auth)/login/page.tsx`: Login page
- `app/(auth)/signup/page.tsx`: Signup page
- `middleware.ts`: Middleware

## Providers

- Email
- Google

## Components

### Sign Up

`import { SignUp } from "@clerk/nextjs"`

### Sign In

`import { SignIn } from "@clerk/nextjs"`

### User Button

`import { UserButton } from "@clerk/nextjs"`

### Signed In

`import { SignedIn } from "@clerk/nextjs"`

### Signed Out

`import { SignedOut } from "@clerk/nextjs"`

### User Profile

`import { UserProfile } from "@clerk/nextjs"`

## Middleware

In the `middleware.ts` file, we use the `clerkMiddleware` and `createRouteMatcher` from `@clerk/nextjs/server` to protect routes.

## Instructions

# Payments Context

## Tech Stack

- Stripe

## Project Structure

## Instructions

# Testing Context
