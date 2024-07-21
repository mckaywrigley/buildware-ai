import { RunIssue } from "@/components/issues/run-issue"
import { NotFound } from "@/components/utility/not-found"
import { getIssueById, getIssueMessagesByIssueId } from "@/db/queries"

export default async function RunIssuePage({
  params: { issueId }
}: {
  params: {
    workspaceId: string
    projectId: string
    issueId: string
  }
}) {
  const issue = await getIssueById(issueId)
  const issueMessages = await getIssueMessagesByIssueId(issueId)

  if (!issue) {
    return <NotFound message="Issue not found" />
  }

  return <RunIssue issue={issue} initialIssueMessages={issueMessages} />
}
