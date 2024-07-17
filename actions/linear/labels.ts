// "use server"

import { AI_LABEL } from "@/lib/constants/linear-config"
import { Issue } from "@linear/sdk"

// import { Issue } from "@linear/sdk"
// import { AI_LABEL } from "../../lib/constants/linear-config"

// export async function handleAILabelAssignment() {
// linearClient: LinearClient,
// issue: Issue,
// organizationId: string
// const planComment = await createComment(
//   linearClient,
//   "Generating a plan...",
//   issue.id
// )
// if (!planComment) {
//   console.error("Failed to create working comment")
//   return
// }
// const workspace = await getWorkspaceByLinearOrganizationId(organizationId)
// if (!workspace) {
//   console.error("Project not found")
//   return
// }
// const embeddingsQueryText = `${issue.title} ${issue.description}`
// const codebaseFiles = await getMostSimilarEmbeddedFiles(
//   embeddingsQueryText,
//   project.id
// )
// const labelAssignmentCodePlanPrompt = await buildCodePlanPrompt({
//   issue: {
//     name: issue.title,
//     description: issue.description ?? ""
//   },
//   codebaseFiles: codebaseFiles.map(file => ({
//     path: file.path,
//     content: file.content ?? ""
//   })),
//   instructionsContext: "No additional instructions."
// })
// const aiCodePlanResponse = await generateAIResponse([
//   { role: "user", content: labelAssignmentCodePlanPrompt }
// ])
// // Update working comment with the plan
// await linearClient.updateComment(planComment.id, {
//   body: aiCodePlanResponse
// })
// // Create a new "Generating PR" comment
// const generatingPRComment = await createComment(
//   linearClient,
//   "Generating PR...",
//   issue.id,
//   planComment.id
// )
// if (!generatingPRComment) {
//   console.error("Failed to create generating PR comment")
//   return
// }
// const codegenPrompt = await buildCodeGenPrompt({
//   issue: { title: issue.title, description: issue.description ?? "" },
//   codebaseFiles: codebaseFiles.map(file => ({
//     path: file.path,
//     content: file.content ?? ""
//   })),
//   plan: aiCodePlanResponse,
//   instructionsContext: "No additional instructions."
// })
// const aiCodeGenResponse = await generateAIResponse([
//   { role: "user", content: codegenPrompt }
// ])
// const parsedAIResponse = parseAIResponse(aiCodeGenResponse)
// // Generate PR
// if (project && project.githubInstallationId) {
//   const prUrl = await generatePR(issue.branchName, project, parsedAIResponse)
//   // Update the "Generating PR" comment with the summary
//   await linearClient.updateComment(generatingPRComment.id, {
//     body: `PR: ${prUrl}`
//   })
// }
// await removeAILabel(issue, AI_LABEL)
// }

export const removeAILabel = async (issue: Issue, labelToRemove: string) => {
  const labels = await issue.labels()
  const aiLabel = labels.nodes.find(label => label.name === labelToRemove)
  if (aiLabel) {
    const updatedLabelIds = labels.nodes
      .filter(label => label.id !== aiLabel.id)
      .map(label => label.id)
    await issue.update({ labelIds: updatedLabelIds })
  }
}

export const checkForAILabel = async (labelNames: string[]) => {
  const aiLabels = [AI_LABEL]
  return labelNames.some(label => aiLabels.includes(label))
}
