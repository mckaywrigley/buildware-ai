import { PromptsList } from "@/components/prompts/prompt-list"
import { getPromptsByUserId } from "@/db/queries/prompt-queries"

export const revalidate = 0

export default async function PromptsPage({
  params
}: {
  params: { projectId: string }
}) {
  const { projectId } = params
  const prompts = await getPromptsByUserId(projectId)

  return <PromptsList prompts={prompts} projectId={projectId} />
}
