import { UsernameForm } from "@/components/profiles/username-form"
import { getProfileByUserId } from "@/db/queries/profiles-queries"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const profile = await getProfileByUserId()

  if (!profile) {
    redirect("/onboarding")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Profile Customization</h1>
      <UsernameForm initialUsername={profile.username || ""} />
    </div>
  )
}