import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import EditPromptForm from "@/components/prompts/edit-prompt-form"
import { NotFound } from "@/components/utility/not-found"
import { getPromptById } from "@/db/queries/prompt-queries"

export const revalidate = 0

export default async function EditPromptPage({
  params
}: {
  params: { id: string }
}) {
  const prompt = await getPromptById(params.id)

  if (!prompt) {
    return <NotFound message="Prompt not found" />
  }

  return (
    <CRUDPage pageTitle="Edit prompt" backText="Back to prompts" backLink="..">
      <EditPromptForm prompt={prompt} />
    </CRUDPage>
  )
}
