import { ProfileCreator } from "@/components/profiles/profile-creator"
import { getProfileByUserId } from "@/db/queries/profiles-queries"
import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export const revalidate = 0

export default async function OnboardingPage() {
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
}
