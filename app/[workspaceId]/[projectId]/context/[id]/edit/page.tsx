import { EditContextGroup } from "@/components/context-groups/edit-context-group"
import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { NotFound } from "@/components/utility/not-found"
import { getEmbeddedFilesByProjectId } from "@/db/queries"
import { getContextGroupById } from "@/db/queries/context-groups-queries"
import { getEmbeddedFilesForContextGroup } from "@/db/queries/context-groups-to-embedded-files-queries"

export const revalidate = 0

export default async function EditContextGroupPage({
  params
}: {
  params: { id: string; projectId: string; workspaceId: string }
}) {
  const contextGroup = await getContextGroupById(params.id)

  if (!contextGroup) {
    return <NotFound message="Context group not found" />
  }

  const embeddedFiles = await getEmbeddedFilesForContextGroup(params.id)
  const allEmbeddedFilesInProject = await getEmbeddedFilesByProjectId(
    params.projectId
  )

  return (
    <CRUDPage
      pageTitle="Edit Context Group"
      backText="Back to Context Groups"
      backLink={`/${params.workspaceId}/${params.projectId}/context`}
    >
      <EditContextGroup
        contextGroup={contextGroup}
        embeddedFiles={embeddedFiles}
        allEmbeddedFilesInProject={allEmbeddedFilesInProject}
      />
    </CRUDPage>
  )
}
