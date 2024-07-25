import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { CreateTemplate } from "@/components/templates/create-template"
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
      <CreateTemplate instructions={instructions} />
    </CRUDPage>
  )
}
