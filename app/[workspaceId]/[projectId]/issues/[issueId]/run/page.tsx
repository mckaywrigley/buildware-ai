import { RunDashboard } from "@/components/issues/runs/run-dashboard"
import { NotFound } from "@/components/utility/not-found"
import {
  getInstructionsByIssueId,
  getIssueById,
  getProjectById
} from "@/db/queries"

export default async function RunIssuePage({
  params: { issueId, projectId }
}: {
  params: {
    workspaceId: string
    projectId: string
    issueId: string
  }
}) {
  const issue = await getIssueById(issueId)
  const project = await getProjectById(projectId)
  const instructionsData = await getInstructionsByIssueId(issueId)
  const instructions = instructionsData.map(item => item.instruction)

  if (!issue) {
    return <NotFound message="Issue not found" />
  }

  if (!project) {
    return <NotFound message="Project not found" />
  }

  return (
    <RunDashboard issue={issue} project={project} instructions={instructions} />
  )
}
