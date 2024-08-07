import { estimateClaudeTokens } from "@/lib/ai/estimate-claude-tokens"
import { limitCodebaseTokens } from "@/lib/ai/limit-codebase-tokens"
import { removeScratchpadTags } from "@/lib/ai/run-system/specification/specification-parser"
import { BUILDWARE_MAX_INPUT_TOKENS } from "@/lib/constants/buildware-config"
import endent from "endent"

export const PLAN_PREFILL = `<plan>`

export const buildPlanPrompt = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  specification,
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
  specification: string
  partialResponse?: string
}) => {
  const systemPrompt = endent`
    You are an expert software engineer.

    You will be given an existing codebase to work with, a task to complete, general instructions & guidelines for the task, a specification for the task, and response instructions.

    Your goal is to use this information to create a detailed implementation plan for the given task.

    This plan will be passed to the implementation step, which will use it to create the implementation (writing the code) for the task.

    Each step should include the following information:
    - A scratchpad for your thoughts on the step
    - The full file path
    - The file status (created, modified, deleted)
    - A list of todos for the file

    To create the plan:
    - Break down the task into clear, logical steps
    - Provide complete, actionable steps for implementation
    - Use pseudocode where appropriate
    - Address all requirements specified in the task and specification
    - Carefully analyze the codebase, task description, general instructions, and specification
    - Focus on implementation details, providing a step-by-step guide on how to complete the task
    - Ensure your plan addresses all aspects of the task specification.

    The plan should **NOT**:
    - Include work that is already done in the codebase

    Use <scratchpad> tags to think through the process as you create the plan.`

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

    # Specification

    To help you complete the task, here's a specification to follow:
    
    ${removeScratchpadTags(specification)}

    ---

    # Response Instructions

    When writing your response, follow these instructions:
    
    ## Response Information

    Respond with the following information:

    - PLAN: The plan for the task.
      - SCRATCHPAD: A scratchpad for your thoughts. Scratchpad tags can be used anywhere in the response where you need to think. This includes at the beginning of the steps, in the middle of the steps, and at the end of the steps. There is no limit to the number of scratchpad tags you can use.
      - STEP: A step in the plan. Contains the step text in markdown format.

    ## Response Format

    Respond in the following format:

    <plan>
      <scratchpad>__SCRATCHPAD_TEXT__</scratchpad>
      <step>__STEP_TEXT__</step>
      ...remaining steps...
    </plan>

    ## Response Example

    An example response:

    <plan>
      <scratchpad>__SCRATCHPAD_TEXT__</scratchpad>
      <step>Step text here...</step>
      <scratchpad>__SCRATCHPAD_TEXT__</scratchpad>
      <step>Step text here...</step>
      ...remaining steps...
    </plan>

    ---

    Now, based on the task information, existing codebase, specification, and instructions provided, create a high-level plan for implementing the task. Present your plan in the format described above.`

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
    const partialPlan = partialResponse.match(/<plan>([\s\S]*)/)?.[1] || ""
    const continuationInstructions = `
      Continue from where you left off. Here is the plan you've generated so far:
      
      ${partialPlan}
    `
    finalUserMessage += `\n\n${continuationInstructions}`
  }

  return {
    systemPrompt,
    userMessage: finalUserMessage,
    prefill: partialResponse ? partialResponse.slice(-100) : PLAN_PREFILL
  }
}
