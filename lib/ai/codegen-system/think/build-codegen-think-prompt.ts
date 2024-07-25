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
}): Promise<{ systemPrompt: string; userMessage: string }> => {
  const systemPrompt = endent`
    You are a world-class project manager and software engineer.

    You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, and response instructions.

    Your goal is to think through how you will complete the given task and determine if you have all the information you need to complete it.
  `

  const { userMessage } = await buildBasePrompt({
    issue,
    codebaseFiles,
    instructionsContext,
    additionalInstructions: "",
    extraSections: "",
    responseInstructions: endent`
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
          <thought_text>Thought text here...</thought_text>
        </thought>
      </thoughts>

      ## Begin Response

      Now begin your response.
    `
  })

  return { systemPrompt, userMessage }
}
