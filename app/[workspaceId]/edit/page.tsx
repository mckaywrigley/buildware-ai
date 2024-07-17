import { NotFound } from "@/components/utility/not-found"
import { EditWorkspaceClient } from "@/components/workspaces/edit-workspace-client"
import { getWorkspaceById } from "@/db/queries/workspaces-queries"

export default async function EditWorkspace({
  params
}: {
  params: { workspaceId: string }
}) {
  const workspace = await getWorkspaceById(params.workspaceId)

  if (!workspace) {
    return <NotFound message="Workspace not found" />
  }

  return (
    <EditWorkspaceClient
      workspace={workspace}
      workspaceId={params.workspaceId}
    />
  )
}
