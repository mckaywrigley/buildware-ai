"use server"

import {
  addInstructionToTemplate,
  getInstructionsForTemplate,
  removeInstructionFromTemplate
} from "@/db/queries/templates-to-instructions-queries"

export async function updateTemplateInstructions(
  templateId: string,
  selectedInstructions: string[]
) {
  try {
    const currentInstructions = await getInstructionsForTemplate(templateId)
    const currentInstructionIds = currentInstructions.map(p => p.instructionId)

    for (const instructionId of currentInstructionIds) {
      if (!selectedInstructions.includes(instructionId)) {
        await removeInstructionFromTemplate(templateId, instructionId)
      }
    }

    for (const instructionId of selectedInstructions) {
      if (!currentInstructionIds.includes(instructionId)) {
        await addInstructionToTemplate(templateId, instructionId)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving instructions:", error)
    return { success: false, error: "Failed to update template instructions" }
  }
}
