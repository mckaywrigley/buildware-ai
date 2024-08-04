import { RunDashboard } from "@/components/issues/runs/run-dashboard"
import { RunHistory } from "@/components/issues/runs/run-history"
import { NotFound } from "@/components/utility/not-found"
import {
  getInstructionsByIssueId,
  getIssueById,
  getProjectById
} from "@/db/queries"
import { getRunHistory } from "@/actions/runs/manage-runs"

export const revalidate = 0

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
  const runHistory = await getRunHistory(issueId)

  if (!issue) {
    return <NotFound message="Issue not found" />
  }

  if (!project) {
    return <NotFound message="Project not found" />
  }

  return (
    <div className="flex flex-col space-y-8">
      <RunDashboard issue={issue} project={project} instructions={instructions} />
      <RunHistory runs={runHistory} />
    </div>
  )
}