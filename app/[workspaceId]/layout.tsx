import { Dashboard } from "@/components/dashboard/dashboard"
import { getProjectsByWorkspaceId } from "@/db/queries/projects-queries"
import { getWorkspacesByUserId } from "@/db/queries/workspaces-queries"

export const revalidate = 0

export default async function WorkspaceLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { workspaceId: string; projectId: string }
}) {
  const workspaces = await getWorkspacesByUserId()
  const projects = await getProjectsByWorkspaceId(params.workspaceId)

  const IntegrationStatus = {
    isGitHubConnected: false,
    isLinearConnected: false
  }

  return (
    <Dashboard
      IntegrationStatus={IntegrationStatus}
      workspaces={workspaces}
      workspaceId={params.workspaceId}
      projectId={params.projectId}
      projects={projects}
    >
      {children}
    </Dashboard>
  )
}
