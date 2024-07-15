import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher(["/onboarding(.*), /projects(.*)"])
const uuidRegex =
  /^\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\/.*)?$/

const isBasicMode = process.env.NEXT_PUBLIC_APP_MODE === "basic"

export default clerkMiddleware(async (auth, req) => {
  if (isBasicMode) {
    return NextResponse.next()
  }

  const { userId, redirectToSignIn } = auth()
  const path = req.nextUrl.pathname
  console.log("Current route:", path)

  const isProtected = isProtectedRoute(req) || uuidRegex.test(path)
  console.log("isProtected", isProtected)

  if (!userId && isProtected) {
    return redirectToSignIn({ returnBackUrl: "/login" })
  }

  if (userId && isProtected) {
    return NextResponse.next()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
}
