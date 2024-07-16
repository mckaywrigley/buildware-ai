import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import EditTemplateForm from "@/components/templates/edit-template-form"
import { NotFound } from "@/components/utility/not-found"
import { getPromptsByProjectId } from "@/db/queries/prompt-queries"
import { getTemplateWithPromptById } from "@/db/queries/template-queries"

export const revalidate = 0

export default async function EditTemplatePage({
  params
}: {
  params: { id: string; projectId: string }
}) {
  const template = await getTemplateWithPromptById(params.id)

  if (!template) {
    return <NotFound message="Template not found" />
  }

  const prompts = await getPromptsByProjectId(params.projectId)

  return (
    <CRUDPage
      pageTitle="New template"
      backText="Back to templates"
      backLink=".."
    >
      <EditTemplateForm templateWithPrompts={template} prompts={prompts} />
    </CRUDPage>
  )
}
