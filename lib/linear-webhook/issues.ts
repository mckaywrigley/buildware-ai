import { LinearWebhookIssue } from "@/lib/types/linear/linear-webhook"
import { LinearClient } from "@linear/sdk"
import { checkForAILabel, handleAILabelAssignment } from "./labels"

export async function handleIssueWebhook(
  linearClient: LinearClient,
  action: string,
  data: LinearWebhookIssue,
  organizationId: string
) {
  const issue = await linearClient.issue(data.id)

  const hasAILabel = await checkForAILabel(data.labels.map(label => label.name))

  if (hasAILabel) {
    switch (action) {
      case "create":
        await handleAILabelAssignment(linearClient, issue, organizationId)
        break
      case "update":
        if (data.createdAt === data.updatedAt) {
          // Skip the double trigger on a create
          console.error("skipped double trigger")
          return
        }
        await handleAILabelAssignment(linearClient, issue, organizationId)
        break
      default:
        console.error("Unknown issue action", action)
    }
  } else {
    // Doesn't have an AI label, skip
    console.error("no AI label found")
  }
}
