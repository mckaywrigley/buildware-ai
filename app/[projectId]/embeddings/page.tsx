import { Button } from "@/components/ui/button"
import { NotFound } from "@/components/utility/not-found"
import { getEmbeddedBranchesByProjectId } from "@/db/queries/embedded-branch-queries"
import { getProjectById } from "@/db/queries/project-queries"
import { Plus } from "lucide-react"
import Link from "next/link"

export const revalidate = 0

export default async function EmbeddingsPage({
  params
}: {
  params: { projectId: string }
}) {
  const project = await getProjectById(params.projectId)

  if (!project) {
    return <NotFound message="Project not found" />
  }

  if (
    !project.githubInstallationId &&
    process.env.NEXT_PUBLIC_APP_MODE !== "basic"
  ) {
    return <NotFound message="Please connect your GitHub account" />
  }

  if (!project.githubRepoFullName) {
    return <NotFound message="No GitHub repo connected" />
  }

  const embeddedBranches =
    (await getEmbeddedBranchesByProjectId(project.id)) || []

  return (
    <div className="text-primary mx-auto w-full max-w-[800px] p-6">
      <div className="mb-6 flex items-start justify-between">
        <div className="text-2xl font-bold">Embedded Branches</div>
        <Link href={`/${project.id}/embeddings/create`}>
          <Button>
            <Plus className="mr-2 size-4" />
            Embed Branch
          </Button>
        </Link>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {embeddedBranches.length > 0 ? (
          embeddedBranches.map(branch => (
            <Link
              href={`./embeddings/${branch.id}`}
              key={branch.id}
              className="bg-secondary border-primary/20 group relative rounded border p-4"
            >
              {branch.branchName}
            </Link>
          ))
        ) : (
          <div>Embed a branch to get started.</div>
        )}
      </div>
    </div>
  )
}
