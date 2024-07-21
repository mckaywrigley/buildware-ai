"use server"

import { getUserId } from "@/actions/auth/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertProfile,
  SelectProfile,
  profilesTable
} from "../schema/profiles-schema"
import { ProfileCreationError, ProfileNotFoundError, ProfileUpdateError, ProfileError } from "@/errors/profile-errors"

export async function createProfile(
  data: Partial<InsertProfile>
): Promise<SelectProfile> {
  try {
    const userId = await getUserId()

    const [profile] = await db
      .insert(profilesTable)
      .values({ ...data, userId })
      .returning()

    revalidatePath("/")
    return profile
  } catch (error) {
    console.error("Error creating profile:", error)
    throw new ProfileCreationError(error.message)
  }
}

export async function getProfileByUserId(): Promise<SelectProfile | undefined> {
  try {
    const userId = await getUserId()

    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })

    if (!profile) {
      throw new ProfileNotFoundError(userId)
    }

    return profile
  } catch (error) {
    console.error("Error fetching profile:", error)
    if (error instanceof ProfileNotFoundError) {
      throw error
    }
    throw new ProfileError(`Failed to fetch profile: ${error.message}`)
  }
}

export async function updateProfile(
  data: Partial<InsertProfile>
): Promise<SelectProfile> {
  try {
    const userId = await getUserId()

    const [updatedProfile] = await db
      .update(profilesTable)
      .set(data)
      .where(eq(profilesTable.userId, userId))
      .returning()

    if (!updatedProfile) {
      throw new ProfileNotFoundError(userId)
    }

    revalidatePath("/")
    return updatedProfile
  } catch (error) {
    console.error("Error updating profile:", error)
    if (error instanceof ProfileNotFoundError) {
      throw error
    }
    throw new ProfileUpdateError(error.message)
  }
}