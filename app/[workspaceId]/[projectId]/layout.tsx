import { Dashboard } from "@/components/dashboard/dashboard"
import { getProjectsByUserId } from "@/db/queries/project-queries"
import { getAllWorkspaces } from "@/db/queries/workspace-queries"

export default async function ProjectLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { projectId: string; workspaceId: string }
}) {
  const projects = await getProjectsByUserId()
  const workspaces = await getAllWorkspaces()
  const project = projects.find(p => p.id === params.projectId)

  if (!project) {
    return <div>Project not found</div>
  }

  const IntegrationStatus = {
    isGitHubConnected: !!project?.githubInstallationId,
    isLinearConnected: !!project?.linearAccessToken
  }

  return children
}
