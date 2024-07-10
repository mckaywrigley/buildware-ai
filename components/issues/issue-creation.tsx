import { auth } from "@clerk/nextjs/server"
import { NewIssueForm } from "./new-issue-form"
import { getTemplatesWithPromptsByUserId } from "@/db/queries/template-queries"

export const IssueCreation = async ({ projectId }: { projectId: string }) => {

   const { userId } = auth()
   if (!userId) {
    throw new Error("User ID is required")
  }
  const templates = await getTemplatesWithPromptsByUserId(userId, projectId)

  return <NewIssueForm templates={templates} />
}