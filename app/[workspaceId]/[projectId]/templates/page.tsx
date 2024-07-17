import { TemplatesList } from "@/components/templates/template-list"
import { getInstructionsByProjectId } from "@/db/queries/instructions-queries"
import { getTemplatesWithInstructionsByProjectId } from "@/db/queries/templates-queries"
import { SelectInstruction, SelectTemplate } from "@/db/schema"

export const revalidate = 0

export default async function TemplatesPage({
  params
}: {
  params: { projectId: string }
}) {
  let templatesWithInstructions: (SelectTemplate & {
    templatesToInstructions: {
      templateId: string
      instructionId: string
      instruction: SelectInstruction
    }[]
  })[] = []
  let instructions: SelectInstruction[] = []

  const { projectId } = params

  try {
    templatesWithInstructions =
      await getTemplatesWithInstructionsByProjectId(projectId)
    instructions = await getInstructionsByProjectId(projectId)
  } catch (error) {
    console.error("Error fetching data:", error)
  }

  return (
    <TemplatesList
      templatesWithInstructions={templatesWithInstructions}
      instructions={instructions}
      projectId={projectId}
    />
  )
}
