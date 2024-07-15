import { Integrations } from "@/components/integrations/integrations"
import { getProjectById } from "@/db/queries/project-queries"

export default async function IntegrationsPage({
  params
}: {
  params: { projectId: string }
}) {
  const project = await getProjectById(params.projectId)

  if (!project) {
    return <div>Project not found</div>
  }

  const isGitHubConnected = !!project.githubInstallationId
  const isLinearConnected = !!project.linearAccessToken

  return (
    <Integrations
      isGitHubConnected={isGitHubConnected}
      isLinearConnected={isLinearConnected}
    />
  )
}
