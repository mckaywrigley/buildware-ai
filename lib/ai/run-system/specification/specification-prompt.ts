import { saveCodegenEval } from "@/actions/evals/save-codegen-eval"
import { estimateClaudeSonnet3_5TokenCount } from "@/lib/ai/estimate-claude-tokens"
import { limitCodebaseTokens } from "@/lib/ai/limit-codebase-tokens"
import endent from "endent"

export const SPECIFICATION_PREFILL = `<specification>`

export const buildSpecificationPrompt = async ({
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
}) => {
  const systemPrompt = endent`
    You are a world-class project manager and software engineer.

    You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, and response instructions.

    Your goal is to use this information to build a specification for the task.`

  const userMessage = endent`
    # Codebase

    The codebase to work with.

    <codebase>
      ${limitCodebaseTokens("", codebaseFiles)}
    </codebase>

    # Task

    The task to complete.

    <task>
      <task_name>${issue.name || "No title provided."}</task_name>
      <task_details>
        ${issue.description || "No details provided."}
      </task_details>
    </task>

    # Instructions and Guidelines

    The instructions and guidelines for the task. Follow these as you build the specification.

    <instructions>
      You should:

      - Focus on the task at hand.
      - Break down the task into clear, logical specifications.
      - Focus on specific implementation details.
      - Never include sections like performance, manual or automated testing, deployment, documentation, etc, unless specifically asked to.

      ${instructionsContext || "No additional instructions provided."}
    </instructions>

    # Response Instructions

    The instructions for how you should respond.

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

  return {
    systemPrompt,
    userMessage
  }
}

export const rebuildSpecificationPrompt = async ({
  prevUserMessage,
  partialResponse,
  codebaseFiles,
  issue,
  instructionsContext
}: {
  prevUserMessage: string
  partialResponse: string
  codebaseFiles: { path: string; content: string }[]
  issue: { name: string; description: string }
  instructionsContext: string
}) => {
  // Extract partial specification
  const partialSpecification =
    partialResponse.match(/<specification>([\s\S]*)/)?.[1] || ""

  // Calculate tokens to remove
  const tokensToRemove = estimateClaudeSonnet3_5TokenCount(partialResponse)

  // Limit codebase files based on the calculated tokens to remove
  const updatedCodebaseFilesText = limitCodebaseTokens("", codebaseFiles)
  const updatedCodebaseFiles = updatedCodebaseFilesText
    .split("<file>")
    .filter(Boolean)
    .map(fileText => {
      const path = fileText.match(/<file_path>(.*?)<\/file_path>/)?.[1] || ""
      const content =
        fileText.match(/<file_content>([\s\S]*?)<\/file_content>/)?.[1] || ""
      return { path, content }
    })

  // Remove tokens from the end of the codebase context
  let removedTokens = 0
  while (removedTokens < tokensToRemove && updatedCodebaseFiles.length > 0) {
    const lastFile = updatedCodebaseFiles[updatedCodebaseFiles.length - 1]
    const lastFileTokens = estimateClaudeSonnet3_5TokenCount(
      `<file><file_path>${lastFile.path}</file_path><file_content>${lastFile.content}</file_content></file>`
    )

    if (removedTokens + lastFileTokens <= tokensToRemove) {
      updatedCodebaseFiles.pop()
      removedTokens += lastFileTokens
    } else {
      break
    }
  }

  const updatedPrompt = await buildSpecificationPrompt({
    issue,
    codebaseFiles: updatedCodebaseFiles,
    instructionsContext
  })

  await saveCodegenEval(
    `${prevUserMessage}\n\n${partialResponse}\n\n${updatedPrompt.userMessage}`,
    issue.name,
    "specification",
    "prompt"
  )

  const continuationInstructions = `
    Continue from where you left off. Here is the specification you've generated so far:
    
    ${partialSpecification}
  `

  return {
    ...updatedPrompt,
    userMessage: `${updatedPrompt.userMessage}\n\n${continuationInstructions}`
  }
}
