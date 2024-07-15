import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import NewTemplateForm from "@/components/templates/new-template-form"
import { getPromptsByProjectId } from "@/db/queries/prompt-queries"

export const revalidate = 0

export default async function CreateTemplatePage({
  params
}: {
  params: { projectId: string }
}) {
  const prompts = await getPromptsByProjectId(params.projectId)

  return (
    <CRUDPage
      pageTitle="New template"
      backText="Back to templates"
      backLink="../templates"
    >
      <NewTemplateForm prompts={prompts} />
    </CRUDPage>
  )
}
