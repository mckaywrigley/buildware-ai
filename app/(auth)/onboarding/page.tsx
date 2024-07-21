import { ProfileCreator } from "@/components/profiles/profile-creator"
import { getProfileByUserId } from "@/db/queries/profiles-queries"
import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export const revalidate = 0

export default async function OnboardingPage() {
  try {
    const profileResult = await getProfileByUserId();

    if ('error' in profileResult) {
      console.error('Error fetching profile:', profileResult.error);
      // Handle the error (e.g., show an error message to the user)
      return (
        <div>An error occurred while fetching your profile. Please try again later.</div>
      );
    }

    if (!profileResult) {
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
      );
    }

    return redirect("/workspaces");
  } catch (error) {
    console.error('Error in OnboardingPage:', error);
    return (
      <div>An unexpected error occurred. Please try again later.</div>
    );
  }
}