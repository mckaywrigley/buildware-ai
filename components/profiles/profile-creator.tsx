"use client"

import { createProfile } from "@/db/queries/profile-queries"
import { createProject } from "@/db/queries/project-queries"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const ProfileCreator = async () => {
  const router = useRouter()

  useEffect(() => {
    const handleCreateProfile = async () => {
      try {
        await createProfile({})
        await createProject({ name: "My project" })
        router.push("/projects")
      } catch (error) {
        console.error(error)
      }
    }

    handleCreateProfile()
  }, [])

  return <></>
}
