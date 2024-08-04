import { EditIssue } from "@/components/issues/edit-issue"
import { getInstructionsByIssueId } from "@/db/queries"
import { getContextGroupsByProjectId } from "@/db/queries/context-groups-queries"
import { getInstructionsByProjectId } from "@/db/queries/instructions-queries"
import { getIssueById } from "@/db/queries/issues-queries"
import { getContextGroupsByIssueId } from "@/db/queries/issue-to-context-groups-queries"

export const revalidate = 0

export default async function EditIssuePage({
  params
}: {
  params: { issueId: string; projectId: string }
}) {
  const issue = await getIssueById(params.issueId)

  if (!issue) {
    return <div>Issue not found</div>
  }

  const allInstructions = await getInstructionsByProjectId(params.projectId)
  const issueInstructions = await getInstructionsByIssueId(params.issueId)
  const allContextGroups = await getContextGroupsByProjectId(params.projectId)
  const issueContextGroups = await getContextGroupsByIssueId(params.issueId)

  return (
    <EditIssue
      issue={issue}
      allInstructions={allInstructions}
      selectedInstructionIds={issueInstructions.map(
        item => item.instruction.id
      )}
      allContextGroups={allContextGroups}
      selectedContextGroupIds={issueContextGroups.map(
        item => item.contextGroupId
      )}
    />
  )
}
