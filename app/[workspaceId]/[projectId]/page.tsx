import { getProjectById } from "@/db/queries/projects-queries"

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

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="text-2xl font-semibold">{project.name}</div>
    </div>
  )
}
