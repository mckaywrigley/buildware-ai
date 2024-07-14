import { TemplatesList } from "@/components/templates/template-list"
import { getPromptsByProjectId } from "@/db/queries/prompt-queries"
import { getTemplatesWithPromptsByProjectId } from "@/db/queries/template-queries"
import { SelectPrompt, SelectTemplate } from "@/db/schema"
import { auth } from "@clerk/nextjs/server"

export const revalidate = 0

export default async function TemplatesPage({
  params
}: {
  params: { projectId: string }
}) {
  const { userId } = auth()
  if (!userId) throw new Error("User not authenticated")

  let templatesWithPrompts: (SelectTemplate & {
    templatesToPrompts: {
      templateId: string
      promptId: string
      prompt: SelectPrompt
    }[]
  })[] = []
  let prompts: SelectPrompt[] = []

  const { projectId } = params

  try {
    templatesWithPrompts = await getTemplatesWithPromptsByProjectId(projectId)
    prompts = await getPromptsByProjectId(projectId)
  } catch (error) {
    console.error("Error fetching data:", error)
  }

  return (
    <TemplatesList
      templatesWithPrompts={templatesWithPrompts}
      prompts={prompts}
      projectId={projectId}
    />
  )
}
