import { estimateClaudeTokens } from "@/lib/ai/estimate-claude-tokens"
import { limitCodebaseTokens } from "@/lib/ai/limit-codebase-tokens"
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
    You are a world-class project manager and software engineer.

    You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, a specification for the task, and response instructions.

    Your goal is to use this information to create a detailed implementation plan for the given task.

    This plan will be passed to the implementation step, which will use it to create the implementation (writing the code) for the task.

    Each step should include the following information:
    - The file path
    - The file status (created, modified, deleted)
    - A list of todos for the file

    Together, the steps should form a complete implementation plan for the given task.

    Your implementation plan should:
    - Provide clear, actionable steps for implementation
    - Include detailed pseudocode where appropriate
    - Address all requirements specified in the task and specification
    
    To create the plan:
    1. Carefully analyze the codebase, task description, general instructions, and specification.
    2. Break down the task into clear, logical steps.
    3. Focus on implementation details, providing a step-by-step guide on how to complete the task.
    4. Use pseudocode instead of actual code when describing implementation details.
    5. Ensure your plan addresses all aspects of the task specification.
    6. Carefully review the existing codebase to avoid duplicating work
    7. Only include steps that introduce new changes or modifications to the codebase

    The plan should **NOT**:
    - Include steps like performance, testing, deployment, documentation, etc, unless specifically asked to

    Before each step:
    - Double-check the codebase to ensure the proposed change doesn't already exist

    Use <scratchpad> tags to think through the process as you create the plan.`

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
    
    ${specification}

    ---

    # Response Instructions

    When writing your response, follow these instructions:
    
    ## Response Information

    Respond with the following information:

    - PLAN: The plan for the task.
      - STEP: A step in the plan. Contains the step text in markdown format.

    (Remember: Use <scratchpad> tags to think through the process as you create the plan.)

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
      <scratchpad>Your thoughts here...</scratchpad>
      <step>Step text here...</step>
      <scratchpad>Your thoughts here...</scratchpad>
      <step>Step text here...</step>
      ...remaining steps...
    </plan>

    ---

    Now, based on the task information, codebase, specification, and instructions provided, create a high-level plan for implementing the task. Present your plan in the format described above.`

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
