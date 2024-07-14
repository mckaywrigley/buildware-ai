"use server"

import { auth } from "@clerk/nextjs/server"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "../db"
import {
  InsertTemplate,
  SelectTemplate,
  templatesTable
} from "../schema/templates-schema"

export async function createTemplateRecords(
  data: Omit<InsertTemplate, "userId">[]
): Promise<SelectTemplate[]> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  try {
    const result = await db
      .insert(templatesTable)
      .values(data.map(template => ({ ...template, userId })))
      .returning()
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating template records:", error)
    throw error
  }
}

export async function getTemplateById(
  id: string
): Promise<SelectTemplate | undefined> {
  try {
    return db.query.templates.findFirst({
      where: eq(templatesTable.id, id)
    })
  } catch (error) {
    console.error(`Error getting template by id ${id}:`, error)
    throw error
  }
}

export async function getTemplatesWithPromptsByProjectId(projectId: string) {
  try {
    const results = await db.query.templates.findMany({
      with: {
        templatesToPrompts: {
          with: {
            prompt: true
          }
        }
      },
      where: (templates, { eq }) => eq(templates.projectId, projectId),
      orderBy: (templates, { desc }) => desc(templates.updatedAt)
    })
    return results
  } catch (error) {
    console.error("Error getting templates for user and project:", error)
    throw error
  }
}

export async function getTemplateWithPromptById(id: string) {
  try {
    return db.query.templates.findFirst({
      with: {
        templatesToPrompts: {
          with: {
            prompt: true
          }
        }
      },
      where: eq(templatesTable.id, id)
    })
  } catch (error) {
    console.error(`Error getting template by id ${id}:`, error)
    throw error
  }
}

export async function updateTemplate(
  id: string,
  data: Partial<Omit<InsertTemplate, "userId" | "projectId">>,
  projectId: string
): Promise<void> {
  try {
    await db
      .update(templatesTable)
      .set({ ...data, projectId })
      .where(eq(templatesTable.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error updating template ${id}:`, error)
    throw error
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  try {
    await db.delete(templatesTable).where(eq(templatesTable.id, id))
    revalidatePath("/")
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error)
    throw error
  }
}

export async function getTemplatesByUserId(): Promise<SelectTemplate[]> {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  try {
    return db.query.templates.findMany({
      where: eq(templatesTable.userId, userId),
      orderBy: desc(templatesTable.updatedAt)
    })
  } catch (error) {
    console.error("Error getting templates for user:", error)
    throw error
  }
}
