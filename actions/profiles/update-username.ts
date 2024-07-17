"use server"

import { updateProfile } from "@/db/queries/profiles-queries"

export async function updateUsername(username: string) {
  try {
    await updateProfile({ username })
  } catch (error) {
    console.error("Failed to update username:", error)
    throw new Error("Failed to update username")
  }
}