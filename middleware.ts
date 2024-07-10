import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(.*)" // UUID regex
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = auth()

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: "/login" })
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && isProtectedRoute(req)) {
    return NextResponse.next()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
}
