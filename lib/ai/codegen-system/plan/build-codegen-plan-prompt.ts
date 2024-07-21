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
}): Promise<string> => {
  const roleDescription = endent`You are a world-class project manager and software engineer.`

  // TODO: clarifications
  const youWillBeGiven = endent`
  You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, your thought process, and response instructions.
  `

  const goalDescription = endent`Your goal is to break down the given task into clear, actionable steps that you can follow to complete the task.`

  const additionalInstructions = endent`
    Create a detailed implementation plan for the given task. Your plan should:

    - Stick to the task at hand.
    - Break down the task into clear, logical steps.
    - Ensure the plan is detailed enough to allow another developer to implement the task.
    - Be 100% correct and complete.
    - Focus on technical implementation details.
    - Not include things like testing, deployment, documentation, etc, unless specifically asked to.`

  const extraSections = endent`
    # Thought Process

    Your thought process for the task.

    <thought_process>
      ${thinkPrompt}
    </thought_process>
    `

  const responseInstructions = endent`
    ## Response Information

    Respond with the following information:

    - STEPS: Enclose your response in <steps> tags to help with parsing.
      - STEP: A step in the plan.
        - STEP_NUMBER: The step number.
        - STEP_NAME: The step name.
        - STEP_DESCRIPTION: The step description.
        - STEP_INSTRUCTIONS: The step instructions in markdown format.

    ## Response Format

    Respond in the following format:

    <steps>
      <step>
        <step_number>__STEP_NUMBER__</step_number>
        <step_name>__STEP_NAME__</step_name>
        <step_description>__STEP_DESCRIPTION__</step_description>
        <step_instructions>__STEP_INSTRUCTIONS__</step_instructions>
      </step>
      ...
    </steps>

    ## Response Example

    An example response:

    <steps>
      <step>
        <step_number>1</step_number>
        <step_name>Step 1</step_name>
        <step_description>Description...</step_description>
        <step_instructions>Instructions...</step_instructions>
      </step>
    </steps>

    ## Begin Response

    Now begin your response.
  `

  return buildBasePrompt({
    issue,
    codebaseFiles,
    instructionsContext,
    youWillBeGiven,
    roleDescription,
    goalDescription,
    additionalInstructions,
    extraSections,
    responseInstructions
  })
}
