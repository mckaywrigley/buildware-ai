import { ProjectSetup } from "@/components/projects/project-setup"
import { createProject } from "@/db/queries/project-queries"
import { listRepos } from "@/lib/actions/github/list-repos"
import { redirect } from "next/navigation"

export const revalidate = 0

export default async function CreateProjectPage({
  params
}: {
  params: { workspaceId: string }
}) {
  const project = await createProject({ name: "New Project" })
  const repos = await listRepos(project.githubInstallationId)

  if (!project) {
    return <div>Failed to create project</div>
  }

  return (
    <div className="mx-auto flex h-screen flex-col items-center justify-center">
      <ProjectSetup className="mt-6" project={project} repos={repos} />
    </div>
  )
}
