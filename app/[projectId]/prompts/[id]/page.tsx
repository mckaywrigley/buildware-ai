import { Prompt } from "@/components/prompts/prompt"
import { NotFound } from "@/components/utility/not-found"
import { getPromptById } from "@/db/queries/prompt-queries"

export const revalidate = 0

export default async function PromptPage({
  params
}: {
  params: { id: string; projectId: string }
}) {
  const prompt = await getPromptById(params.id)

  if (!prompt) {
    return <NotFound message="Prompt not found" />
  }

  return <Prompt prompt={prompt} />
}
