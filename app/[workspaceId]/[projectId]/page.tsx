import { getProjectById, getTotalRuns } from "@/db/queries/projects-queries"

export const revalidate = 0

export default async function ProjectPage({
  params
}: {
  params: { projectId: string; workspaceId: string }
}) {
  const project = await getProjectById(params.projectId)

  if (!project) {
    return <div>Project not found</div>
  }

  const totalRuns = await getTotalRuns(params.projectId)

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="text-2xl font-semibold">{project.name}</div>
      <div className="mt-4 text-lg">Total Runs: {totalRuns}</div>
    </div>
  )
}