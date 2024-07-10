import { LinearClient } from "@linear/sdk"

export const createReaction = async (
  linearClient: LinearClient,
  id: string,
  emoji: string,
  isComment = false
) => {
  try {
    return await linearClient.createReaction({
      emoji,
      ...(isComment ? { commentId: id } : { issueId: id })
    })
  } catch (error) {
    console.error("Error creating reaction:", error)
  }
}
