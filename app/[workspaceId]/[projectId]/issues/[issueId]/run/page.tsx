import { RunIssue } from "@/components/issues/runs/run-issue"
import { NotFound } from "@/components/utility/not-found"
import {
  getInstructionsByIssueId,
  getIssueById,
  getIssueMessagesByIssueId,
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
  const issueMessages = await getIssueMessagesByIssueId(issueId)
  const project = await getProjectById(projectId)
  const attachedInstructions = await getInstructionsByIssueId(issueId)

  if (!issue) {
    return <NotFound message="Issue not found" />
  }

  if (!project) {
    return <NotFound message="Project not found" />
  }

  return (
    <RunIssue
      issue={issue}
      initialIssueMessages={issueMessages}
      project={project}
      attachedInstructions={attachedInstructions}
    />
  )
}
