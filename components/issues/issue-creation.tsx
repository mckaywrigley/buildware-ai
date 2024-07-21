import { getTemplatesWithInstructionsByProjectId } from "@/db/queries/templates-queries"
import { CreateIssue } from "./create-issue"

export const IssueCreation = async ({ projectId }: { projectId: string }) => {
  const templates = await getTemplatesWithInstructionsByProjectId(projectId)

  return <CreateIssue templates={templates} />
}
