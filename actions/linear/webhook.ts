import {
  LinearWebhookBody,
  LinearWebhookComment,
  LinearWebhookIssue
} from "@/types/linear/linear"
import { LinearClient } from "@linear/sdk"
import { handleCommentWebhook } from "./comments"
import { handleIssueWebhook } from "./issues"

export async function handleWebhook(
  linearClient: LinearClient,
  body: LinearWebhookBody
) {
  const { type, action, data, organizationId } = body

  switch (type) {
    case "Issue":
      await handleIssueWebhook(
        linearClient,
        action,
        data as LinearWebhookIssue,
        organizationId
      )
      break
    case "Comment":
      await handleCommentWebhook(
        linearClient,
        action,
        data as LinearWebhookComment
      )
      break
    default:
      console.error("Unused type", type)
  }
}
