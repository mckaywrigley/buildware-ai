import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import NewPromptForm from "@/components/prompts/new-prompt-form"

export const revalidate = 0

export default async function CreatePromptPage() {
  return (
    <CRUDPage
      pageTitle="New prompt"
      backText="Back to prompts"
      backLink="../prompts"
    >
      <NewPromptForm />
    </CRUDPage>
  )
}
