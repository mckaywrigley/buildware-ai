import { Integrations } from "@/components/integrations/integrations"
import { NotFound } from "@/components/utility/not-found"
import { getProjectById, getWorkspaceById } from "@/db/queries"

export default async function IntegrationsPage({
  params
}: {
  params: { projectId: string; workspaceId: string }
}) {
  const workspace = await getWorkspaceById(params.workspaceId)
  const project = await getProjectById(params.projectId)

  if (!workspace) {
    return <NotFound message="Workspace not found" />
  }

  if (!project) {
    return <NotFound message="Project not found" />
  }

  const isGitHubConnected = !!project.githubInstallationId
  const isLinearConnected = !!workspace.linearAccessToken

  return (
    <Integrations
      isGitHubConnected={isGitHubConnected}
      isLinearConnected={isLinearConnected}
    />
  )
}
