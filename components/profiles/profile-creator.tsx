"use client"

import { createProject, createWorkspace } from "@/db/queries"
import { createProfile } from "@/db/queries/profiles-queries"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import { ProfileCreationError } from "@/errors/profile-errors"

export const ProfileCreator = () => {
  const router = useRouter()

  useEffect(() => {
    const handleCreateProfile = async () => {
      try {
        await createProfile({})
        const workspace = await createWorkspace({ name: "My Workspace" })
        const project = await createProject({
          name: "My Project",
          workspaceId: workspace.id
        })
        router.push(`/${workspace.id}/${project.id}/issues`)
      } catch (error) {
        console.error(error)
        if (error instanceof ProfileCreationError) {
          toast.error(error.message)
        } else {
          toast.error("An unexpected error occurred while creating your profile.")
        }
        // Optionally, redirect to an error page or stay on the current page
      }
    }

    handleCreateProfile()
  }, [])

  return <></>
}