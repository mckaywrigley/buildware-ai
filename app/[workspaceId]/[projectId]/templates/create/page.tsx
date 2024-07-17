import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import NewTemplateForm from "@/components/templates/new-template-form"
import { getInstructionsByProjectId } from "@/db/queries/instructions-queries"

export const revalidate = 0

export default async function CreateTemplatePage({
  params
}: {
  params: { projectId: string }
}) {
  const instructions = await getInstructionsByProjectId(params.projectId)

  return (
    <CRUDPage
      pageTitle="New template"
      backText="Back to templates"
      backLink="../templates"
    >
      <NewTemplateForm instructions={instructions} />
    </CRUDPage>
  )
}
