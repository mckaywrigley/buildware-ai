import { PromptsList } from "@/components/prompts/prompt-list"
import { getPromptsByProjectId } from "@/db/queries/prompt-queries"

export const revalidate = 0

export default async function PromptsPage({
  params
}: {
  params: { projectId: string }
}) {
  const prompts = await getPromptsByProjectId(params.projectId)

  return <PromptsList prompts={prompts} />
}
