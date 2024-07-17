"use server"

import { getUserId } from "@/actions/auth/auth"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertEmbeddedBranch,
  SelectEmbeddedBranch,
  embeddedBranchesTable
} from "../schema"

export async function createEmbeddedBranch(
  data: Omit<InsertEmbeddedBranch, "userId">
): Promise<SelectEmbeddedBranch> {
  const userId = await getUserId()

  try {
    const result = await db
      .insert(embeddedBranchesTable)
      .values({ ...data, userId })
      .returning()
    revalidatePath("/")
    return result[0]
  } catch (error) {
    console.error("Error creating embedded branch records:", error)
    throw error
  }
}

export async function getEmbeddedBranchesByProjectId(projectId: string) {
  try {
    const branches = await db.query.embeddedBranches.findMany({
      where: and(eq(embeddedBranchesTable.projectId, projectId))
    })
    return branches
  } catch (error) {
    console.error(error)
  }
}

export async function getEmbeddedBranchById(id: string) {
  try {
    const branch = await db.query.embeddedBranches.findFirst({
      where: and(eq(embeddedBranchesTable.id, id))
    })
    return branch
  } catch (error) {
    console.error("Error fetching embedded branch:", error)
    throw error
  }
}

export async function updateEmbeddedBranchById(
  id: string,
  data: Partial<InsertEmbeddedBranch>
) {
  try {
    const result = await db
      .update(embeddedBranchesTable)
      .set(data)
      .where(eq(embeddedBranchesTable.id, id))
      .returning()
    revalidatePath("/")
    return result[0]
  } catch (error) {
    console.error("Error updating embedded branch:", error)
    throw error
  }
}

export async function findEmbeddedBranch({
  projectId,
  githubRepoFullName,
  branchName
}: {
  projectId: string
  githubRepoFullName: string
  branchName: string
}) {
  try {
    const branch = await db.query.embeddedBranches.findFirst({
      where: and(
        eq(embeddedBranchesTable.projectId, projectId),
        eq(embeddedBranchesTable.githubRepoFullName, githubRepoFullName),
        eq(embeddedBranchesTable.branchName, branchName)
      )
    })
    return branch
  } catch (error) {
    console.error("Error finding embedded branch:", error)
    throw error
  }
}
