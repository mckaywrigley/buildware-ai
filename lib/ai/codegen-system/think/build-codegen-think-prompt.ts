import endent from "endent"
import { buildBasePrompt } from "../base-codegen-prompts"

export const buildCodegenThinkPrompt = async ({
  issue,
  codebaseFiles,
  instructionsContext
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
}): Promise<string> => {
  const roleDescription = endent`You are a world-class project manager and software engineer.`

  const youWillBeGiven = endent`
  You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, and response instructions.`

  const goalDescription = endent`Your goal is to think through how you will complete the given task and determine if you have all the information you need to complete it.`

  const additionalInstructions = endent``

  const extraSections = endent``

  const responseInstructions = endent`
    ## Response Information

    Respond with the following information:

    - THOUGHTS: Enclose your response in <thoughts> tags to help with parsing.
      - THOUGHT: A thought in the thought process.
        - THOUGHT_NUMBER: The thought number.
        - THOUGHT_TEXT: The thought text in markdown format.

    ## Response Format

    Respond in the following format:

    <thoughts>
      <thought>
        <thought_number>__THOUGHT_NUMBER__</thought_number>
        <thought_text>__THOUGHT_TEXT__</thought_text>
      </thought>
      ...
    </thoughts>

    ## Response Example

    An example response:

    <thoughts>
      <thought>
        <thought_number>1</thought_number>
        <thought_text>Thought 1</thought_text>
      </thought>
    </thoughts>

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
