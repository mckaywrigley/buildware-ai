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
    
    The specification should be a high-level outline or plan for implementing the task.

    Each step should be a bullet point that briefly but completely describes the step in markdown format. Keep the steps short and concise. 3 sentences or less per step.
    
    To create the specification:
    - Focus on the task at hand
    - Break down the task into clear, logical steps
    - Provide an overview of what needs to be done without diving into code-level details
    - Focus on the "what" rather than the "how"
    - Serve as a roadmap for developers to follow when implementing the task

    The specification should **NOT**:
    - Include specific code snippets or implementation details
    - Include steps like performance, testing, deployment, documentation, etc, unless specifically asked to`

  const userMessageTemplate = endent`
    # Codebase

    First, review the codebase you'll be working with:

    <codebase>
      {{CODEBASE_PLACEHOLDER}}
    </codebase>

    # Task

    Now, here's the task you need to complete:

    <task>
      <task_name>${issue.name || "No name provided."}</task_name>
      <task_details>
        ${issue.description || "No details provided."}
      </task_details>
    </task>

    # Instructions and Guidelines

    Keep in mind these general instructions and guidelines while working on the task:

    <instructions>
      ${instructionsContext || "No additional instructions provided."}
    </instructions>

    # Response Instructions

    When writing your response, follow these instructions:

    ## Response Information

    Respond with the following information:

    - SPECIFICATION: The specification for the task.
      - STEP: A step in the specification. Contains the step text in markdown format.

    ## Response Format

    Respond in the following format:

    <specification>
      <step>__STEP_TEXT__</step>
      ...
    </specification>

    ## Response Example

    An example response:

    <specification>
      <step>Step text here...</step>
      <step>Step text here...</step>
      ...
    </specification>`

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
