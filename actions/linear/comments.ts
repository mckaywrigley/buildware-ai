"use server"

import { SelectEmbeddedFile } from "@/db/schema"
import { LinearWebhookComment } from "@/types/linear/linear"
import { Comment, Issue, LinearClient } from "@linear/sdk"
import endent from "endent"
import { IN_PROGRESS_EMOJI } from "../../lib/constants/linear-config"
import { generateAIResponse } from "../ai/generate-ai-response"
import { createReaction } from "./reactions"

export async function handleCommentWebhook(
  linearClient: LinearClient,
  action: string,
  data: LinearWebhookComment
) {
  const issue = await linearClient.issue(data.issueId)

  switch (action) {
    case "create":
      if (checkForAIAtMention(data.body)) {
        const useCodebase = checkForCodebaseAtMention(data.body)

        await handleAtAIComment(linearClient, issue, data, useCodebase)
      }
      break
    default:
      console.error("Unknown comment action", action)
  }
}

export const createComment = async (
  linearClient: LinearClient,
  body: string,
  issueId: string,
  parentId?: string
) => {
  const response = await linearClient.createComment({ body, issueId, parentId })
  return response.comment
}

export async function handleAtAIComment(
  linearClient: LinearClient,
  issue: Issue,
  comment: LinearWebhookComment,
  useCodebase: boolean
) {
  await createReaction(linearClient, comment.id, IN_PROGRESS_EMOJI, true)

  // removes @ai and @codebase from the body
  const strippedBody =
    comment.body.replace(/@(codebase|ai)\b/g, "").trim() || "begin task"

  const codebaseFiles: Partial<SelectEmbeddedFile & { similarity: number }>[] =
    []

  if (useCodebase) {
    // const embeddingsQueryText = `${issue.title} ${issue.description} ${strippedBody}`
    // codebaseFiles = await getMostSimilarEmbeddedFiles(
    //   embeddingsQueryText,
    //   issue.projectId
    // )
  }

  let threadComments: Comment[] = []

  const parentCommentId = comment.parentId

  if (parentCommentId) {
    const parentComment = (
      await issue.comments({
        filter: { id: { eq: parentCommentId } }
      })
    ).nodes[0]

    const childrenComments = (
      await parentComment.children({
        id: parentCommentId
      })
    ).nodes

    threadComments = [parentComment, ...childrenComments].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )
  }

  const commentPrompt = await buildCommentPrompt(
    issue,
    threadComments,
    useCodebase
      ? codebaseFiles.map(file => ({
          path: file.path ?? "",
          content: file.content ?? ""
        }))
      : []
  )

  const aiResponse = await generateAIResponse([
    {
      role: "user",
      content: commentPrompt + strippedBody
    }
  ])

  await createComment(
    linearClient,
    aiResponse,
    issue.id,
    comment.parentId || comment.id
  )
}

export const buildCommentPrompt = async (
  issue: Issue,
  comments: Comment[],
  codebaseFiles: {
    path: string
    content: string
  }[]
): Promise<string> => {
  const commentStrings = await Promise.all(
    comments.map(async comment => {
      const user = await comment.user
      const botName = comment.botActor?.name
      return `${user?.name || botName || "Unknown User"}: ${comment.body}`
    })
  )

  return endent`
    You are an AI that completes coding tasks.
    
    Here is some context about your assigned task:

    # Title
    ${issue.title}

    ## Description
    ${issue.description}
    
    ${
      comments.length > 0
        ? `## Comments
      ${commentStrings.join("\n")}`
        : ""
    }

    ---

    ${
      codebaseFiles.length > 0
        ? `Here is some context about the codebase:
        # Codebase Files
    ${codebaseFiles.map(file => `## File Path: ${file.path}\n${file.content}`).join("\n\n")}`
        : ""
    }

    ---

    Now, use the context to respond to the user's comment. Respond as markdown.
  `
}

export const checkForAIAtMention = (text: string) =>
  text.trim().toLowerCase().startsWith("@ai")

export const checkForCodebaseAtMention = (text: string): boolean => {
  return /@codebase\b/.test(text)
}
