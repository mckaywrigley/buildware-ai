import { EmbeddedBranch } from "@/components/embedded-branch/embedded-branch"
import { NotFound } from "@/components/utility/not-found"
import { getEmbeddedBranchById } from "@/db/queries/embedded-branch-queries"
import { getProjectById } from "@/db/queries/project-queries"

export const revalidate = 0

export default async function EmbeddedBranchPage({
  params
}: {
  params: { id: string; projectId: string }
}) {
  const project = await getProjectById(params.projectId)

  if (!project) {
    return <NotFound message="Project not found" />
  }

  const embeddedBranch = await getEmbeddedBranchById(params.id)

  if (!embeddedBranch) {
    return <NotFound message="Embedded branch not found" />
  }

  return <EmbeddedBranch project={project} embeddedBranch={embeddedBranch} />
}
