import { RunIssue } from "@/components/issues/run-issue"
import {
  getIssueById,
  getIssueMessagesByIssueId,
  getProjectById
} from "@/db/queries"

export default async function RunIssuePage({
  params: { workspaceId, projectId, issueId }
}: {
  params: {
    workspaceId: string
    projectId: string
    issueId: string
  }
}) {
  const issue = await getIssueById(issueId)
  const project = await getProjectById(projectId)
  const messages = await getIssueMessagesByIssueId(issueId)

  if (!issue || !project) {
    return <div>Issue or project not found</div>
  }

  return (
    <RunIssue
      workspaceId={workspaceId}
      projectId={projectId}
      issueId={issueId}
      initialIssue={issue}
      initialProject={project}
      initialMessages={messages}
    />
  )
}
