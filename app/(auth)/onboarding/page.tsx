import { ProfileCreator } from "@/components/profiles/profile-creator"
import { getProfileByUserId } from "@/db/queries/profiles-queries"
import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ProfileNotFoundError } from "@/errors/profile-errors"
import { Button } from "@/components/ui/button"

export const revalidate = 0

export default async function OnboardingPage() {
  try {
    const profile = await getProfileByUserId()

    if (!profile) {
      return (
        <Suspense
          fallback={
            <div className="flex min-h-screen animate-pulse items-center justify-center gap-2">
              <Loader2 className="size-6 animate-spin" />
              <div>Creating profile</div>
            </div>
          }
        >
          <ProfileCreator />
        </Suspense>
      )
    }

    if (profile) {
      return redirect("/workspaces")
    }
  } catch (error) {
    console.error("Error during onboarding:", error)
    if (error instanceof ProfileNotFoundError) {
      // Handle the case where the profile is not found
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-2xl font-bold mb-4">Profile Not Found</div>
          <div className="text-lg mb-4">We couldn't find your profile. Let's create one!</div>
          <ProfileCreator />
        </div>
      )
    } else {
      // Handle other unexpected errors
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-2xl font-bold mb-4">Oops! Something went wrong</div>
          <div className="text-lg mb-4">We encountered an unexpected error. Please try again later.</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )
    }
  }
}