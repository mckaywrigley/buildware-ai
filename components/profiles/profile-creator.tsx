"use client"

import { createProject, createWorkspace } from "@/db/queries"
import { createProfile } from "@/db/queries/profiles-queries"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const ProfileCreator = async () => {
  const router = useRouter()

  useEffect(() => {
    const handleCreateProfile = async () => {
      try {
        await createProfile({})
        const workspace = await createWorkspace({ name: "My Workspace" })
        await createProject({
          name: "My Project",
          workspaceId: workspace.id
        })
        router.push(`/workspaces/${workspace.id}`)
      } catch (error) {
        console.error(error)
      }
    }

    handleCreateProfile()
  }, [])

  return <></>
}
