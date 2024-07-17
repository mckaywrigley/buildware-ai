"use client"

import { createProfile } from "@/db/queries/profiles-queries"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const ProfileCreator = async () => {
  const router = useRouter()

  useEffect(() => {
    const handleCreateProfile = async () => {
      try {
        await createProfile({})
        router.push("/workspaces")
      } catch (error) {
        console.error(error)
      }
    }

    handleCreateProfile()
  }, [])

  return <></>
}
