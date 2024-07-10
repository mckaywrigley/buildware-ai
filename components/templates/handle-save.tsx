'use server'

import { getPromptsForTemplate, removePromptFromTemplate, addPromptToTemplate } from "@/db/queries/templates-to-prompts-queries"

export async function updateTemplatePrompts(templateId: string, selectedPrompts: string[]) {
  try {
    const currentPrompts = await getPromptsForTemplate(templateId)
    const currentPromptIds = currentPrompts.map(p => p.promptId)

    for (const promptId of currentPromptIds) {
      if (!selectedPrompts.includes(promptId)) {
        await removePromptFromTemplate(templateId, promptId)
      }
    }

    for (const promptId of selectedPrompts) {
      if (!currentPromptIds.includes(promptId)) {
        await addPromptToTemplate(templateId, promptId)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving prompts:', error)
    return { success: false, error: 'Failed to update template prompts' }
  }
}
