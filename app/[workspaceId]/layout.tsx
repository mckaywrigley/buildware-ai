import { Dashboard } from "@/components/dashboard/dashboard"
import { getProjectsByUserId } from "@/db/queries/project-queries"
import { getAllWorkspaces } from "@/db/queries/workspace-queries"

export default async function WorkspaceLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { workspaceId: string }
}) {
  const projects = await getProjectsByUserId()
  const workspaces = await getAllWorkspaces()

  const IntegrationStatus = {
    isGitHubConnected: false,
    isLinearConnected: false
  }

  return (
    <Dashboard
      IntegrationStatus={IntegrationStatus}
      projects={projects}
      workspaces={workspaces}
      workspaceId={params.workspaceId}
      projectId={projects[0]?.id || ""}
    >
      {children}
    </Dashboard>
  )
}
