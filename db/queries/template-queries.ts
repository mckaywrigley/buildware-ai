"use server"

import { getUserId } from "@/actions/auth/auth"
import { eq } from "drizzle-orm"
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
  const userId = await getUserId()

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

export async function getTemplatesWithInstructionsByProjectId(
  projectId: string
) {
  try {
    const results = await db.query.templates.findMany({
      with: {
        templatesToInstructions: {
          with: {
            instruction: true
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

export async function getTemplateWithInstructionById(id: string) {
  try {
    return db.query.templates.findFirst({
      with: {
        templatesToInstructions: {
          with: {
            instruction: true
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
