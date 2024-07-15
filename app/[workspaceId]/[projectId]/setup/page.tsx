import { ProjectSetup } from "@/components/projects/project-setup"
import { getProjectById } from "@/db/queries/project-queries"
import { listRepos } from "@/lib/actions/github/list-repos"
import { GitHubRepository } from "@/lib/types/github"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const revalidate = 0

export default async function SetupPage({
  params
}: {
  params: { projectId: string }
}) {
  const project = await getProjectById(params.projectId)

  if (!project) {
    return <div>Project not found</div>
  }

  let repos: GitHubRepository[] = []
  repos = await listRepos(project.githubInstallationId)

  return (
    <div className="mx-auto flex h-screen flex-col items-center justify-center">
      {!project.githubInstallationId && (
        <Link
          href="/projects"
          className="text-muted-foreground hover:text-primary flex items-center"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to projects
        </Link>
      )}

      <ProjectSetup className="mt-6" project={project} repos={repos} />
    </div>
  )
}
