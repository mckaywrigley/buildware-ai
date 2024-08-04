import { ContextGroupsList } from "@/components/context-groups/context-groups-list"
import { getContextGroupsByProjectId } from "@/db/queries/context-groups-queries"

export const revalidate = 0

export default async function ContextGroupsPage({
  params
}: {
  params: { projectId: string; workspaceId: string }
}) {
  const contextGroups = await getContextGroupsByProjectId(params.projectId)

  return <ContextGroupsList contextGroups={contextGroups} />
}
