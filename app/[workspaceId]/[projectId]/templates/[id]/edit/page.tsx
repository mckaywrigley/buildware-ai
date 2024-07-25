import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { EditTemplate } from "@/components/templates/edit-template"
import { NotFound } from "@/components/utility/not-found"
import { getInstructionsByProjectId } from "@/db/queries/instructions-queries"
import { getTemplateWithInstructionById } from "@/db/queries/templates-queries"

export const revalidate = 0

export default async function EditTemplatePage({
  params
}: {
  params: { id: string; projectId: string }
}) {
  const template = await getTemplateWithInstructionById(params.id)

  if (!template) {
    return <NotFound message="Template not found" />
  }

  const instructions = await getInstructionsByProjectId(params.projectId)

  return (
    <CRUDPage
      pageTitle="Edit template"
      backText="Back to templates"
      backLink=".."
    >
      <EditTemplate
        templateWithInstructions={template}
        instructions={instructions}
      />
    </CRUDPage>
  )
}
