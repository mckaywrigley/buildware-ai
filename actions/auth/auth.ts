"use server"

import { auth } from "@clerk/nextjs/server"

const IS_SIMPLE_MODE = process.env.NEXT_PUBLIC_APP_MODE === "simple"
const SIMPLE_USER_ID = "simple_user_1"

export async function getUserId() {
  if (IS_SIMPLE_MODE) {
    return SIMPLE_USER_ID
  }

  const { userId } = auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  return userId
}
