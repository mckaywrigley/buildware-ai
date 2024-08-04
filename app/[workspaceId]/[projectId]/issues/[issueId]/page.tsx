import { IssueView } from "@/components/issues/issue-view"
import { NotFound } from "@/components/utility/not-found"
import { getFilesByContextGroupIds } from "@/db/queries/context-groups-to-embedded-files-queries"
import { getContextGroupsByIssueId } from "@/db/queries/issue-to-context-groups-queries"
import { getIssueById } from "@/db/queries/issues-queries"
import { getInstructionsByIssueId } from "@/db/queries/issues-to-instructions-queries"
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

  const attachedInstructions = await getInstructionsByIssueId(issue.id)
  const attachedContextGroups = await getContextGroupsByIssueId(issue.id)
  const contextGroupIds = attachedContextGroups.map(cg => cg.contextGroupId)
  const contextGroupFiles = await getFilesByContextGroupIds(contextGroupIds)

  const enhancedAttachedContextGroups = attachedContextGroups.map(cg => ({
    ...cg,
    contextGroup: {
      ...cg.contextGroup,
      files: contextGroupFiles
        .filter(f => f.contextGroupId === cg.contextGroupId)
        .map(f => ({
          id: f.id,
          path: f.path,
          type: f.path.endsWith("/") ? "folder" : "file"
        }))
    }
  }))

  return (
    <IssueView
      item={issue}
      project={project}
      attachedInstructions={attachedInstructions}
      attachedContextGroups={enhancedAttachedContextGroups.map(cg => ({
        ...cg,
        contextGroup: {
          ...cg.contextGroup,
          files: cg.contextGroup.files.map(file => ({
            ...file,
            type: file.type as "folder" | "file"
          }))
        }
      }))}
      workspaceId={params.workspaceId}
    />
  )
}
