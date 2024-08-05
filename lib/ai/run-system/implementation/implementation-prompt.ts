import { estimateClaudeTokens } from "@/lib/ai/estimate-claude-tokens"
import { limitCodebaseTokens } from "@/lib/ai/limit-codebase-tokens"
import { BUILDWARE_MAX_INPUT_TOKENS } from "@/lib/constants/buildware-config"
import endent from "endent"

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

    Your goal is to use this information to write all of the code needed to complete the given task.

    Ensure your code is of the highest quality, follows best practices, and fully & effectively completes the given task.
        
    Follow these guidelines:
    1. Carefully analyze the existing codebase and understand its structure.
    2. Identify which files need to be created, modified, or deleted to accomplish the task.
    3. Write clean, efficient, and well-commented code that adheres to best practices and the general instructions provided.
    4. Ensure your code integrates seamlessly with the existing codebase.
    5. If you need to create new files, provide the full file path and full file content.
    6. For modified files, provide the full file path and full updated file content.
    7. For deleted files, only provide the full file path.

    Use <scratchpad> tags to think through the process as you create the implementation.
    
    ---

    # Task

    First, review the task information:

    <task>
      <task_name>${issue.name || "No title provided."}</task_name>
      <task_details>
        ${issue.description || "No details provided."}
      </task_details>
    </task>

    ---

    # Instructions and Guidelines

    Keep in mind these general instructions and guidelines while working on the task:

    <instructions>
      ${instructionsContext || "No additional instructions provided."}
    </instructions>

    ---

    # Plan

    To help you complete the task, here's a plan to follow:

    ${plan}

    ---

    # Response Instructions

    When writing your response, follow these instructions:
    
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

    (Use <scratchpad> tags to think through the process as you create the implementation.)
  
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
        ...remaining files...
      </file_list>
    </pull_request>`

  const userMessageTemplate = endent`
    # Codebase

    First, review the codebase you'll be working with:

    <codebase>
      {{CODEBASE_PLACEHOLDER}}
    </codebase>

    ---

    Now, based on the task information, codebase, plan, and instructions provided, create the implementation for the task. Present your implementation in the format described above.`

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
