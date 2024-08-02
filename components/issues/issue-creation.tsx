import { getTemplatesWithInstructionsByProjectId } from "@/db/queries/templates-queries"
import { getContextGroupsByProjectId } from "@/db/queries/context-groups-queries"
import { CreateIssue } from "./create-issue"

export const IssueCreation = async ({ projectId }: { projectId: string }) => {
  const templates = await getTemplatesWithInstructionsByProjectId(projectId)
  const contextGroups = await getContextGroupsByProjectId(projectId)

  return <CreateIssue templates={templates} contextGroups={contextGroups} />
}
