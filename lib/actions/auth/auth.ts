"use server"

import { auth } from "@clerk/nextjs/server"

const IS_BASIC_MODE = process.env.NEXT_PUBLIC_APP_MODE === "basic"
const BASIC_USER_ID = "basic_user_1"

export async function getUserId() {
  if (IS_BASIC_MODE) {
    return BASIC_USER_ID
  }

  const { userId } = auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  return userId
}
