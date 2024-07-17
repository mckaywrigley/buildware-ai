import { IssueView } from "@/components/issues/issue-view"
import { NotFound } from "@/components/utility/not-found"
import { getIssueById } from "@/db/queries/issues-queries"
import { getInstructionsForIssue } from "@/db/queries/issues-to-instructions-queries"
import { getProjectById } from "@/db/queries/projects-queries"

export const revalidate = 0

export default async function IssuePage({
  params
}: {
  params: { issueId: string; projectId: string; workspaceId: string }
}) {
  const issue = await getIssueById(params.issueId)

  if (!issue) {
    return <NotFound message="Issue not found" />
  }

  const project = await getProjectById(issue.projectId)

  if (!project) {
    return <NotFound message="Project not found" />
  }

  const attachedInstructions = await getInstructionsForIssue(issue.id)

  return (
    <IssueView
      item={issue}
      project={project}
      attachedInstructions={attachedInstructions}
      workspaceId={params.workspaceId}
    />
  )
}
