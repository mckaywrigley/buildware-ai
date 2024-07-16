import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { NewEmbeddedBranchForm } from "@/components/embedded-branch/new-embedded-branch-form"
import { NotFound } from "@/components/utility/not-found"
import { getEmbeddedBranchesByProjectId } from "@/db/queries/embedded-branch-queries"
import { getProjectById } from "@/db/queries/project-queries"
import { listBranches } from "@/lib/actions/github/list-branches"

export const revalidate = 0

export default async function CreateEmbeddedBranchPage({
  params
}: {
  params: { projectId: string }
}) {
  const project = await getProjectById(params.projectId)

  if (!project) {
    return <NotFound message="Project not found" />
  }

  if (!project.githubInstallationId) {
    return <NotFound message="No GitHub installation ID" />
  }

  if (!project.githubRepoFullName) {
    return <NotFound message="No GitHub repo connected" />
  }

  const embeddedBranches =
    (await getEmbeddedBranchesByProjectId(project.id)) || []

  const branches = await listBranches(
    project.githubInstallationId,
    project.githubRepoFullName
  )

  return (
    <CRUDPage
      pageTitle="Embed new branch"
      backText="Back to embedded branches"
      backLink="../embeddings"
    >
      <NewEmbeddedBranchForm
        project={project}
        branches={branches.filter(
          branch => !embeddedBranches.some(eb => eb.branchName === branch)
        )}
      />
    </CRUDPage>
  )
}
