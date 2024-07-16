"use server"

import { getProjectByLinearOrganizationId } from "@/db/queries/project-queries"
import { Issue, LinearClient } from "@linear/sdk"
import endent from "endent"
import fs from "fs/promises"
import { encode } from "gpt-tokenizer"
import path from "path"
import { generatePR } from "../actions/github/generate-pr"
import { generateAIResponse } from "../actions/llm"
import { getMostSimilarEmbeddedFiles } from "../actions/retrieval/codebase"
import {
  CODE_AI_LABEL,
  PLAN_AI_LABEL,
  STANDARD_AI_LABEL
} from "../constants/linear-webhook"
import { parseAIResponse } from "../utils/parse-ai-response"
import { createComment } from "./comments"

function estimateClaudeSonnet3_5TokenCount(text: string): number {
  // Claude tokenizer is ~1.25-1.35 times more expensive than GPT, using 1.4 to be safe
  return encode(text).length * 1.4
}

function limitTokens(
  basePrompt: string,
  files: { path: string; content: string }[]
): { prompt: string; includedFiles: typeof files; tokensUsed: number } {
  let totalTokens = estimateClaudeSonnet3_5TokenCount(basePrompt)
  const includedFiles: typeof files = []

  for (const file of files) {
    const fileContent = `# File Path: ${file.path}\n${file.content}`
    const fileTokens = estimateClaudeSonnet3_5TokenCount(fileContent)

    if (
      totalTokens + fileTokens <=
      parseInt(process.env.NEXT_PUBLIC_MAX_INPUT_TOKENS!)
    ) {
      includedFiles.push(file)
      totalTokens += fileTokens
    } else {
      break
    }
  }

  const codebaseContext =
    includedFiles.length > 0
      ? `# Available Codebase Files\n${includedFiles.map(file => `## File Path: ${file.path}\n${file.content}`).join("\n\n")}`
      : "No codebase files."

  const prompt = `${basePrompt}${codebaseContext}`
  return {
    prompt,
    includedFiles,
    tokensUsed: totalTokens
  }
}

async function ensureDirectoryExists(filePath: string) {
  const directory = path.dirname(filePath)
  await fs.mkdir(directory, { recursive: true })
}

export async function handleAILabelAssignment(
  linearClient: LinearClient,
  issue: Issue,
  organizationId: string
) {
  const planComment = await createComment(
    linearClient,
    "Generating a plan...",
    issue.id
  )
  if (!planComment) {
    console.error("Failed to create working comment")
    return
  }

  const project = await getProjectByLinearOrganizationId(organizationId)
  if (!project) {
    console.error("Project not found")
    return
  }

  const embeddingsQueryText = `${issue.title} ${issue.description}`

  const codebaseFiles = await getMostSimilarEmbeddedFiles(
    embeddingsQueryText,
    project.id
  )

  const labelAssignmentCodePlanPrompt =
    await buildLabelAssignmentCodePlanPrompt({
      issue: {
        title: issue.title,
        description: issue.description ?? ""
      },
      codebaseFiles: codebaseFiles.map(file => ({
        path: file.path,
        content: file.content ?? ""
      })),
      instructionsContext: "No additional instructions."
    })

  const aiCodePlanResponse = await generateAIResponse([
    { role: "user", content: labelAssignmentCodePlanPrompt }
  ])

  // Update working comment with the plan
  await linearClient.updateComment(planComment.id, {
    body: aiCodePlanResponse
  })

  // Create a new "Generating PR" comment
  const generatingPRComment = await createComment(
    linearClient,
    "Generating PR...",
    issue.id,
    planComment.id
  )

  if (!generatingPRComment) {
    console.error("Failed to create generating PR comment")
    return
  }

  const labelAssignmenCodeGenPrompt = await buildLabelAssignmentCodeGenPrompt({
    issue: { title: issue.title, description: issue.description ?? "" },
    codebaseFiles: codebaseFiles.map(file => ({
      path: file.path,
      content: file.content ?? ""
    })),
    plan: aiCodePlanResponse,
    instructionsContext: "No additional instructions."
  })

  const aiCodeGenResponse = await generateAIResponse([
    { role: "user", content: labelAssignmenCodeGenPrompt }
  ])

  const parsedAIResponse = parseAIResponse(aiCodeGenResponse)

  // Generate PR
  if (project && project.githubInstallationId) {
    const prUrl = await generatePR(issue.branchName, project, parsedAIResponse)

    // Update the "Generating PR" comment with the summary
    await linearClient.updateComment(generatingPRComment.id, {
      body: `PR: ${prUrl}`
    })
  }

  await removeAILabel(issue, STANDARD_AI_LABEL)
}

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
  const aiLabels = [STANDARD_AI_LABEL, CODE_AI_LABEL, PLAN_AI_LABEL]
  return labelNames.some(label => aiLabels.includes(label))
}

export const buildLabelAssignmentCodePlanPrompt = async ({
  issue,
  codebaseFiles,
  instructionsContext
}: {
  issue: {
    title: string
    description: string
  }
  codebaseFiles: {
    path: string
    content: string
  }[]
  instructionsContext: string
}): Promise<string> => {
  const basePrompt = endent`
    # AI Task Planning Assistant

    You are an AI specialized in creating detailed implementation plans for coding tasks.

    You will be given a task, codebase, and instructions.
    
    Your goal is to break down the given issue into clear, actionable steps that another developer can follow to complete the task.
    
    Create a detailed implementation plan for the given issue. Your plan should:

    - Stick to the task at hand.
    - Break down the task into clear, logical steps.
    - Ensure the plan is detailed enough to allow another developer to implement the task.
    - Be 100% correct and complete.

    Note: Focus solely on the technical implementation. Ignore any mentions of human tasks or non-technical aspects.

    Encoded in XML tags, here is what you will be given:

    TASK: Information about the task.
    CODEBASE: Files from the codebase.
    INSTRUCTIONS: Instructions and guidelines on how to complete the task.
    FORMAT: Instructions on how to format your response.

    ---

    # Task

    <task>

    # Title
    ${issue.title ?? "No title."}

    ## Description
    ${issue.description ?? "No description."}

    </task>

    ---

    # Codebase

    <codebase>
  `

  const formatInstructions = endent`
    </codebase>

    ---

    # Instructions

    <instructions>

    Follow these instructions:

    ${instructionsContext}

    </instructions>

    ---

    # Format

    <format>

    Format your response as follows:

    1. Present your plan as a numbered list of steps.
    2. Use markdown formatting.

    </format>
  `

  const { prompt, tokensUsed } = limitTokens(basePrompt, codebaseFiles)
  const finalPrompt = `${prompt}\n${formatInstructions}`
  console.warn(`Code Plan Prompt: Tokens used: ${tokensUsed}`)
  const filePath = path.join(process.cwd(), "logs", "code-plan-prompt.txt")
  await ensureDirectoryExists(filePath)
  await fs.writeFile(filePath, finalPrompt, "utf8")
  return finalPrompt
}

export const buildLabelAssignmentCodeGenPrompt = async ({
  issue,
  codebaseFiles,
  plan,
  instructionsContext
}: {
  issue: {
    title: string
    description: string
  }
  codebaseFiles: {
    path: string
    content: string
  }[]
  plan: string
  instructionsContext: string
}): Promise<string> => {
  const basePrompt = endent`
  # AI Expert Developer

  You are an expert developer who is tasked with implementing a given task.

  You will be given a task, a codebase, instructions, and an implementation plan.
  
  Your goal is to write all the code needed to complete the given task, ensuring it integrates well with the existing codebase and follows best practices.

  Use the plan to guide your implementation. It may or may not be complete, so double-check your work as you go.

  Note: Focus solely on the technical implementation. Ignore any mentions of human tasks or non-technical aspects.

  Encoded in XML tags, here is what you will be given:

  TASK: Context about the task to complete.
  INSTRUCTIONS: Instructions on how to complete the task.
  CODEBASE: Files from the codebase you have access to.
  IMPLEMENTATION_PLAN: A detailed implementation plan for the given issue.
  FORMAT: Instructions for how to format your response.

  ---
  
  # Task

  <task>
    
  # Title
  ${issue.title ?? "No title."}

  ## Description
  ${issue.description ?? "No description."}

  </task>

  ---

  # Codebase

  <codebase>
  `

  const formatInstructions = `
  </codebase>

  ---

  # Instructions

  <instructions>

  Follow these instructions:

  ${instructionsContext}

  </instructions>

  ---

  # Implementation Plan

  <implementation_plan>

  ${plan}

  </implementation_plan>

  ---

  # Format

  <format>

  Generate the full content for each new or modified file.
  
  Only provide the full path for each deleted file.

  If you don't need to modify a file, don't include it - this simplifies Git diffs.

  Format your response as follows:
  <file_list>
  FILE_PATH_1
  FILE_PATH_2
  ...
  </file_list>

  Then, for each file:
  <file>
  <file_path>__FILE_PATH__</file_path>
  <file_content language="__LANGUAGE__">
  __FILE_CONTENT__
  </file_content>
  <file_status>__STATUS__</file_status>
  </file>

  Please adhere to the following guidelines:

  FILE_PATH: Use the full path from the project root.
  Example: 'components/Button.tsx'

  LANGUAGE: Specify the language or file type. For example:
  'tsx' for .tsx files
  'javascript' for .js files
  'css' for .css files
  'json' for .json files
  etc

  FILE_CONTENT: Provide the complete file content, including all necessary imports, function definitions, and exports. Ensure proper indentation.

  STATUS: Use 'new' for newly created files, 'modified' for existing files that are being updated, and 'deleted' for files that are being deleted.

  Example:
  <file>
  <file_path>components/IssueList.tsx</file_path>
  <file_content language="tsx">
  import React from 'react';
  import { Issue } from '../types';
  interface IssueListProps {
  issues: Issue[];
  }
  export const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  return (
  <ul>
  {issues.map((issue) => (
  <li key={issue.id}>{issue.title}</li>
  ))}
  </ul>
  );
  };
  </file_content>
  <file_status>new</file_status>
  </file>

  Ensure that:
  - The content includes all necessary imports, function definitions, and exports.
  - The code is properly formatted and follows the project's coding standards.
  - Necessary comments for clarity are included if needed.
  - Pseudocode is translated into actual code.
  - You complete all necessary work.

  Also provide a PR title:
  <pr_title>
  __PR_TITLE__
  </pr_title>

  </format>
  `

  const { prompt, tokensUsed } = limitTokens(basePrompt, codebaseFiles)
  const finalPrompt = `${prompt}${formatInstructions}`
  console.warn(`Code Gen Prompt: Tokens used: ${tokensUsed}`)
  const filePath = path.join(process.cwd(), "logs", "code-gen-prompt.txt")
  await ensureDirectoryExists(filePath)
  await fs.writeFile(filePath, finalPrompt, "utf8")
  return finalPrompt
}
