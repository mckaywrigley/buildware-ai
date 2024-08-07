import { BUILDWARE_MAX_INPUT_TOKENS } from "@/lib/constants/buildware-config"
import endent from "endent"
import { estimateClaudeTokens } from "../../estimate-claude-tokens"
import { limitCodebaseTokens } from "../../limit-codebase-tokens"

export const SPECIFICATION_PREFILL = "<specification>"

export const buildSpecificationPrompt = async ({
  issue,
  codebaseFiles,
  instructionsContext,
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
  partialResponse?: string
}) => {
  const systemPrompt = endent`
    You are an expert software engineer.

    You will be given an existing codebase to work with, a task to complete, general instructions & guidelines for the task, and response instructions.

    Your goal is to use this information to build a high-level specification for the task.

    This specification will be passed to the plan step, which will use it to create a plan for implementing the task.

    Each step should include the following information:
    - A scratchpad for your thoughts on the step
    - A list of todos for the step

    To create the specification:
    - Break down the task into clear, logical steps
    - Provide an overview of what needs to be done without diving into code-level details
    - Focus on the "what" rather than the "how"
    
    The specification should **NOT**:
    - Include work that is already done in the codebase
    - Include specific code snippets

    Use <scratchpad> tags to think through the process as you create the specification.`

  const userMessageTemplate = endent`
    # Existing Codebase

    First, review the existing codebase you'll be working with:

    <codebase>
      {{CODEBASE_PLACEHOLDER}}
    </codebase>
    
    ---

    # Task

    Next, review the task information:

    <task>
      <task_name>${issue.name || "No name provided."}</task_name>
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

    # Response Instructions

    When writing your response, follow these instructions:

    ## Response Information

    Respond with the following information:

    - SPECIFICATION: The specification for the task.
      - SCRATCHPAD: A scratchpad for your thoughts. Scratchpad tags can be used anywhere in the response where you need to think. This includes at the beginning of the steps, in the middle of the steps, and at the end of the steps. There is no limit to the number of scratchpad tags you can use.
      - STEP: A step in the specification. Contains the step text in markdown format.

    ## Response Format

    Respond in the following format:

    <specification>
      <scratchpad>__SCRATCHPAD_TEXT__</scratchpad>
      <step>__STEP_TEXT__</step>
      ...remaining steps...
    </specification>

    ## Response Example

    An example response:

    <specification>
      <scratchpad>__SCRATCHPAD_TEXT__</scratchpad>
      <step>Step text here...</step>
      <scratchpad>__SCRATCHPAD_TEXT__</scratchpad>
      <step>Step text here...</step>
      ...remaining steps...
    </specification>

    ---

    Now, based on the task information, existing codebase, and instructions provided, create a high-level specification for implementing the task. Present your specification in the format described above.`

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
    const partialSpecification =
      partialResponse.match(/<specification>([\s\S]*)/)?.[1] || ""
    const continuationInstructions = `
      Continue from where you left off. Here is the specification you've generated so far:
      
      ${partialSpecification}
    `
    finalUserMessage += `\n\n${continuationInstructions}`
  }

  return {
    systemPrompt,
    userMessage: finalUserMessage,
    prefill: partialResponse
      ? partialResponse.slice(-100)
      : SPECIFICATION_PREFILL
  }
}
