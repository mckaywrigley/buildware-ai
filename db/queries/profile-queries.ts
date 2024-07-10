"use server"

import { auth } from "@clerk/nextjs/server"
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
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  const [profile] = await db
    .insert(profilesTable)
    .values({ ...data, userId })
    .returning()

  revalidatePath("/")
  return profile
}

export async function getProfileByUserId(): Promise<SelectProfile | undefined> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  return db.query.profiles.findFirst({
    where: eq(profilesTable.userId, userId)
  })
}

export async function updateProfile(
  data: Partial<InsertProfile>
): Promise<SelectProfile> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  const [updatedProfile] = await db
    .update(profilesTable)
    .set(data)
    .where(eq(profilesTable.userId, userId))
    .returning()
  revalidatePath("/")
  return updatedProfile
}

export async function updateProfileByUserId(
  data: Partial<InsertProfile>
): Promise<SelectProfile> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  const [updatedProfile] = await db
    .update(profilesTable)
    .set(data)
    .where(eq(profilesTable.userId, userId))
    .returning()
  revalidatePath("/")
  return updatedProfile
}
