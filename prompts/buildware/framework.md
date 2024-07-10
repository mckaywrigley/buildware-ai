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
