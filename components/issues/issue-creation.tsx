import { getTemplatesWithPromptsByProjectId } from "@/db/queries/template-queries"
import { auth } from "@clerk/nextjs/server"
import { NewIssueForm } from "./new-issue-form"

export const IssueCreation = async ({ projectId }: { projectId: string }) => {
  const { userId } = auth()
  if (!userId) {
    throw new Error("User ID is required")
  }
  const templates = await getTemplatesWithPromptsByProjectId(projectId)

  return <NewIssueForm templates={templates} />
}
