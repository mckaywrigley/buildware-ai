import { LinearWebhookIssue } from "@/types/linear/linear"
import { LinearClient } from "@linear/sdk"
import { checkForAILabel } from "./labels"

export async function handleIssueWebhook(
  linearClient: LinearClient,
  action: string,
  data: LinearWebhookIssue,
  organizationId: string
) {
  console.warn("organizationId", organizationId)

  const issue = await linearClient.issue(data.id)
  console.warn("issue", issue)

  const hasAILabel = await checkForAILabel(data.labels.map(label => label.name))

  if (hasAILabel) {
    switch (action) {
      case "create":
        return
        // await handleAILabelAssignment(linearClient, issue, organizationId)
        break
      case "update":
        if (data.createdAt === data.updatedAt) {
          // Skip the double trigger on a create
          console.error("skipped double trigger")
          return
        }
        return
        // await handleAILabelAssignment(linearClient, issue, organizationId)
        break
      default:
        console.error("Unknown issue action", action)
    }
  } else {
    // Doesn't have an AI label, skip
    console.error("no AI label found")
  }
}
