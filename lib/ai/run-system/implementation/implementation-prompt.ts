import { estimateClaudeTokens } from "@/lib/ai/estimate-claude-tokens"
import { limitCodebaseTokens } from "@/lib/ai/limit-codebase-tokens"
import { BUILDWARE_MAX_INPUT_TOKENS } from "@/lib/constants/buildware-config"
import endent from "endent"
import { PLAN_PREFILL } from "../plan/plan-prompt"

export const IMPLEMENTATION_PREFILL = `<pull_request>`

export const buildImplementationPrompt = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  plan,
  partialResponse
}: {
  issue: {
    name: string
    description: string
  }
  codebaseFiles: {
    path: string
    content: string
  }[]
  instructionsContext: string
  plan: string
  partialResponse?: string
}) => {
  const systemPrompt = endent`
    You are a world-class software engineer.

    You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, a plan for the task, and response instructions.

    Your goal is to use this information to write all the code needed to complete the given task.`

  const userMessageTemplate = endent`
    # Codebase

    The codebase to work with.

    <codebase>
      {{CODEBASE_PLACEHOLDER}}
    </codebase>

    # Task

    The task to complete.

    <task>
      <task_name>${issue.name || "No title provided."}</task_name>
      <task_details>
        ${issue.description || "No details provided."}
      </task_details>
    </task>

    # Instructions and Guidelines

    The instructions and guidelines for the task. Follow these as you build the specification.

    <instructions>
      You should:

      - Stick to the task at hand.
      - Break down the task into clear, logical steps.
      - Focus on implementation details.
      - Always use pseudocode instead of actual code.
      - Never include sections like performance, manual or automated testing, deployment, documentation, etc, unless specifically asked to.

      ${instructionsContext || "No additional instructions provided."}
    </instructions>

    # Plan

    A plan to help complete the task.

    ${PLAN_PREFILL + plan}
    
    ## Response Information

    Respond with the following information:

    - PULL_REQUEST: The full content for the PR.
      - PR_TITLE: The title of the PR. Maximum 100 characters.
      - PR_DESCRIPTION: The description of the PR. Maximum 500 characters.
      - FILE_LIST: Enclose your response in <file_list> tags to help with parsing.
        - FILE: Each file that is being modified, created, or deleted.
          - FILE_STATUS: Use 'new' for newly created files, 'modified' for existing files that are being updated, and 'deleted' for files that are being deleted.
          - FILE_PATH: The full path from the project root, including the file extension.
          - FILE_CONTENT: The complete file content, including all necessary imports, function definitions, and exports.
          
    ## Response Format

    For new or modified files, generate the full content for the file. For deleted files, only provide the full path.
  
    Respond in the following format:

    <pull_request>
      <pr_title>__PR_TITLE__</pr_title>
      <pr_description>__PR_DESCRIPTION__</pr_description>
      <file_list>
        <file>
          <file_status>__STATUS__</file_status>
          <file_path>__FILE_PATH__</file_path>
          <file_content>
            __FILE_CONTENT__
          </file_content>
        </file>
      ...
      </file_list>
    </pull_request>

    # Response Instructions

    The instructions for how you should respond.
  
    ## Response Example

    An example response:

    <pull_request>
      <pr_title>PR title here...</pr_title>
      <pr_description>PR description here...</pr_description>
      <file_list>
        <file>
          <file_status>file status here...</file_status>
          <file_path>file path here...</file_path>
          <file_content>
            file content here...
          </file_content>
        </file>
        ...
      </file_list>
    </pull_request>`

  const systemPromptTokens = estimateClaudeTokens(systemPrompt)
  const userMessageTemplateTokens = estimateClaudeTokens(userMessageTemplate)
  const usedTokens = systemPromptTokens + userMessageTemplateTokens
  let availableCodebaseTokens = BUILDWARE_MAX_INPUT_TOKENS - usedTokens

  if (partialResponse) {
    const tokensToRemove = estimateClaudeTokens(partialResponse)
    availableCodebaseTokens -= tokensToRemove
  }

  const codebaseContent = limitCodebaseTokens(
    codebaseFiles,
    usedTokens,
    availableCodebaseTokens
  )
  const userMessage = userMessageTemplate.replace(
    "{{CODEBASE_PLACEHOLDER}}",
    (match, offset) =>
      offset === userMessageTemplate.indexOf(match) ? codebaseContent : match
  )

  let finalUserMessage = userMessage

  if (partialResponse) {
    const partialImplementation =
      partialResponse.match(/<pull_request>([\s\S]*)/)?.[1] || ""
    const continuationInstructions = `
      Continue from where you left off. Here is the implementation you've generated so far:
      
      ${partialImplementation}
    `
    finalUserMessage += `\n\n${continuationInstructions}`
  }

  return {
    systemPrompt,
    userMessage: finalUserMessage,
    prefill: partialResponse
      ? partialResponse.slice(-100)
      : IMPLEMENTATION_PREFILL
  }
}
