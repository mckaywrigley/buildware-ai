import { estimateClaudeTokens } from "@/lib/ai/estimate-claude-tokens"
import { limitCodebaseTokens } from "@/lib/ai/limit-codebase-tokens"
import { BUILDWARE_MAX_INPUT_TOKENS } from "@/lib/constants/buildware-config"
import endent from "endent"

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
    You are a world-class project manager and software engineer.

    You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, and response instructions.

    Your goal is to use this information to build a specification for the task.

    This specification will be passed to the plan step, which will use it to create a plan for implementing the task.
    
    The specification should be a high-level outline or plan for implementing the task.

    Each step should include the following information:
    - The file path(s) that the step will need
    - The file status(es) that the step will need (created, modified, deleted)
    - A list of todos for the step

    To create the specification:
    - Focus on the task at hand
    - Break down the task into clear, logical steps
    - Provide an overview of what needs to be done without diving into code-level details
    - Focus on the "what" rather than the "how"
    - Carefully review the existing codebase to avoid duplicating work
    - Only include steps that introduce new changes or modifications to the codebase

    The specification should **NOT**:
    - Include work that is already done in the codebase
    - Include specific code snippets
    - Include steps like performance, testing, deployment, documentation, etc, unless specifically asked to

    Before each step:
    - Double-check the codebase to ensure the proposed change doesn't already exist

    Use <scratchpad> tags to think through the process as you create the specification.`

  const userMessageTemplate = endent`
    # Codebase

    First, review the codebase you'll be working with:

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
      - STEP: A step in the specification. Contains the step text in markdown format.

    (Remember: Use <scratchpad> tags to think through the process as you create the specification.)

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
      <scratchpad>Your thoughts here...</scratchpad>
      <step>Step text here...</step>
      <scratchpad>Your thoughts here...</scratchpad>
      <step>Step text here...</step>
      ...remaining steps...
    </specification>

    ---

    Now, based on the task information, codebase, and instructions provided, create a high-level specification for implementing the task. Present your specification in the format described above.`

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
