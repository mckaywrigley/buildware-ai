import { getTemplatesWithInstructionsByProjectId } from "@/db/queries/templates-queries"
import { CreateIssueForm } from "./create-issue-form"

export const IssueCreation = async ({ projectId }: { projectId: string }) => {
  const templates = await getTemplatesWithInstructionsByProjectId(projectId)

  return <CreateIssueForm templates={templates} />
}
