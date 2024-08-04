import { getInstructionsByProjectId } from "@/db/queries"
import { getContextGroupsByProjectId } from "@/db/queries/context-groups-queries"
import { getTemplatesWithInstructionsByProjectId } from "@/db/queries/templates-queries"
import { CreateIssue } from "./create-issue"

export const IssueCreation = async ({ projectId }: { projectId: string }) => {
  const templates = await getTemplatesWithInstructionsByProjectId(projectId)
  const contextGroups = await getContextGroupsByProjectId(projectId)
  const instructions = await getInstructionsByProjectId(projectId)

  return (
    <CreateIssue
      templates={templates}
      contextGroups={contextGroups}
      instructions={instructions}
    />
  )
}
