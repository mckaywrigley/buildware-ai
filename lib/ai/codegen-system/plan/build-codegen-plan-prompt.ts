import endent from "endent"
import { buildBasePrompt } from "../base-codegen-prompts"

export const buildCodegenPlanPrompt = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  thinkPrompt
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
  thinkPrompt: string
}): Promise<{ systemPrompt: string; userMessage: string }> => {
  const systemPrompt = endent`
    You are a world-class project manager and software engineer.

    You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, your thought process, and response instructions.

    Your goal is to break down the given task into clear, actionable steps that you can follow to complete the task.
  `

  const { userMessage } = await buildBasePrompt({
    step: "plan",
    issue,
    codebaseFiles,
    instructionsContext,
    additionalInstructions: endent`
      Create a detailed implementation plan for the given task. Your plan should:

      - Stick to the task at hand.
      - Break down the task into clear, logical steps.
      - Ensure the plan is detailed enough to allow another developer to implement the task.
      - Be 100% correct and complete.
      - Focus on technical implementation details.
      - Not include things like testing, deployment, documentation, etc, unless specifically asked to.
    `,
    extraSections: endent`
      # Thought Process

      Your thought process for the task.

      <thought_process>
        ${thinkPrompt}
      </thought_process>
    `,
    responseInstructions: endent`
      ## Response Information

      Respond with the following information:

      - STEPS: Enclose your response in <steps> tags to help with parsing.
        - STEP: A step in the plan.
          - STEP_NUMBER: The step number.
          - STEP_TEXT: The step text in markdown format.

      ## Response Format

      Respond in the following format:

      <steps>
        <step>
          <step_number>__STEP_NUMBER__</step_number>
          <step_text>__STEP_TEXT__</step_text>
        </step>
        ...
      </steps>

      ## Response Example

      An example response:

      <steps>
        <step>
          <step_number>1</step_number>
          <step_text>Step text here...</step_text>
        </step>
      </steps>

      ## Begin Response

      Now begin your response.
    `
  })

  return { systemPrompt, userMessage }
}
