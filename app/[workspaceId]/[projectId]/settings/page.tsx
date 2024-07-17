import { listRepos } from "@/actions/github/list-repos"
import { ProjectSetup } from "@/components/projects/project-setup"
import { getProjectById } from "@/db/queries/projects-queries"
import { GitHubRepository } from "@/types/github"

export const revalidate = 0

export default async function SettingsPage({
  params
}: {
  params: { projectId: string; workspaceId: string }
}) {
  const project = await getProjectById(params.projectId)

  if (!project) {
    return <div>Project not found</div>
  }

  let repos: GitHubRepository[] = []
  repos = await listRepos(project.githubInstallationId)

  return (
    <div className="mx-auto flex h-screen flex-col items-center justify-center">
      <ProjectSetup className="mt-6" project={project} repos={repos} />
    </div>
  )
}
