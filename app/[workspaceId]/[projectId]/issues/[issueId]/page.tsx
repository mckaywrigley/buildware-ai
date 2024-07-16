import { IssueView } from "@/components/issues/issue-view"
import { NotFound } from "@/components/utility/not-found"
import { getIssueById } from "@/db/queries/issue-queries"
import { getPromptsForIssue } from "@/db/queries/issues-to-prompts-queries"
import { getProjectById } from "@/db/queries/project-queries"

export const revalidate = 0

export default async function IssuePage({
  params
}: {
  params: { issueId: string }
}) {
  const issue = await getIssueById(params.issueId)

  if (!issue) {
    return <NotFound message="Issue not found" />
  }

  const project = await getProjectById(issue.projectId)

  if (!project) {
    return <NotFound message="Project not found" />
  }

  const attachedPrompts = await getPromptsForIssue(issue.id)

  return (
    <IssueView
      item={issue}
      project={project}
      attachedPrompts={attachedPrompts}
      workspaceId={project.workspaceId!}
    />
  )
}
