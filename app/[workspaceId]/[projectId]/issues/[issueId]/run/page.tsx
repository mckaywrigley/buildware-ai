import { RunDashboard } from "@/components/issues/runs/run-dashboard"
import { NotFound } from "@/components/utility/not-found"
import {
  getInstructionsByIssueId,
  getIssueById,
  getProjectById
} from "@/db/queries"

export const revalidate = 0

export default async function RunIssuePage({
  params,
  searchParams
}: {
  params: {
    workspaceId: string
    projectId: string
    issueId: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const issue = await getIssueById(params.issueId)
  const project = await getProjectById(params.projectId)
  const instructionsData = await getInstructionsByIssueId(params.issueId)
  const instructions = instructionsData.map(item => item.instruction)

  if (!issue) {
    return <NotFound message="Issue not found" />
  }

  if (!project) {
    return <NotFound message="Project not found" />
  }

  const runId = searchParams.runId as string | undefined

  return (
    <RunDashboard 
      issue={issue} 
      project={project} 
      instructions={instructions} 
      runId={runId}
    />
  )
}