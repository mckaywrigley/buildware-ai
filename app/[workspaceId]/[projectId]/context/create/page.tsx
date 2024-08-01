import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { getEmbeddedFilesByProjectId } from "@/db/queries/embedded-files-queries"
import { CreateContextGroup } from "@/components/context-groups/create-context-group"

export const revalidate = 0

export default async function CreateContextGroupPage({
  params
}: {
  params: { projectId: string; workspaceId: string }
}) {
  const embeddedFiles = await getEmbeddedFilesByProjectId(params.projectId)

  return (
    <CRUDPage
      pageTitle="New Context Group"
      backText="Back to Context Groups"
      backLink={`../context`}
    >
      <CreateContextGroup embeddedFiles={embeddedFiles} />
    </CRUDPage>
  )
}
