import { getProjectById } from "@/db/queries/project-queries"
import { redirect } from "next/navigation"

export const revalidate = 0

export default async function ProjectPage({
  params
}: {
  params: { projectId: string }
}) {
  const { projectId } = params

  const project = await getProjectById(projectId)

  if (!project) {
    return <div>Project not found</div>
  }

  if (!project.hasSetup) {
    return redirect(`/${projectId}/setup`)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="text-2xl font-semibold">{project.name}</div>
    </div>
  )
}
