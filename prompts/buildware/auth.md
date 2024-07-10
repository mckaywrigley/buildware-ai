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
