import { getWorkspaceById } from "@/db/queries/workspaces-queries"

export const revalidate = 0

export default async function WorkspacePage({
  params
}: {
  params: { workspaceId: string }
}) {
  const { workspaceId } = params

  const workspaces = await getWorkspaceById(workspaceId)

  if (!workspaces) {
    return <div>Workspace not found</div>
  }

  return <div>{workspaces.name}</div>
}
