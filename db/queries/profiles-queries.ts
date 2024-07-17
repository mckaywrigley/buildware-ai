"use server"

import { getUserId } from "@/actions/auth/auth"
import console from "console"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertProfile,
  SelectProfile,
  profilesTable
} from "../schema/profiles-schema"

export async function createProfile(
  data: Partial<InsertProfile>
): Promise<SelectProfile> {
  const userId = await getUserId()

  const [profile] = await db
    .insert(profilesTable)
    .values({ ...data, userId })
    .returning()

  revalidatePath("/")
  return profile
}

export async function getProfileByUserId(): Promise<SelectProfile | undefined> {
  const userId = await getUserId()

  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })
    return profile
  } catch (error) {
    console.error(error)
  }
}

export async function updateProfile(
  data: Partial<InsertProfile>
): Promise<SelectProfile> {
  const userId = await getUserId()

  const [updatedProfile] = await db
    .update(profilesTable)
    .set(data)
    .where(eq(profilesTable.userId, userId))
    .returning()
  revalidatePath("/")
  return updatedProfile
}
