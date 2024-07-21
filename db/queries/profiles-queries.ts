"use server"

import { getUserId } from "@/actions/auth/auth"
import { logError } from "@/lib/utils"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertProfile,
  SelectProfile,
  profilesTable
} from "../schema/profiles-schema"

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function createProfile(
  data: Partial<InsertProfile>
): Promise<SelectProfile | { error: string }> {
  try {
    if (!data.userId) {
      throw new ValidationError('User ID is required');
    }

    const userId = await getUserId();

    const [profile] = await db
      .insert(profilesTable)
      .values({ ...data, userId })
      .returning();

    revalidatePath("/");
    return profile;
  } catch (error) {
    logError('createProfile', error);
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    return { error: 'An error occurred while creating the profile' };
  }
}

export async function getProfileByUserId(): Promise<SelectProfile | { error: string }> {
  try {
    const userId = await getUserId();

    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    });

    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    return profile;
  } catch (error) {
    logError('getProfileByUserId', error);
    if (error instanceof NotFoundError) {
      return { error: error.message };
    }
    return { error: 'An error occurred while fetching the profile' };
  }
}

export async function updateProfile(
  data: Partial<InsertProfile>
): Promise<SelectProfile | { error: string }> {
  try {
    const userId = await getUserId();

    if (Object.keys(data).length === 0) {
      throw new ValidationError('No update data provided');
    }

    const [updatedProfile] = await db
      .update(profilesTable)
      .set(data)
      .where(eq(profilesTable.userId, userId))
      .returning();

    if (!updatedProfile) {
      throw new NotFoundError('Profile not found');
    }

    revalidatePath("/");
    return updatedProfile;
  } catch (error) {
    logError('updateProfile', error);
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return { error: error.message };
    }
    return { error: 'An error occurred while updating the profile' };
  }
}