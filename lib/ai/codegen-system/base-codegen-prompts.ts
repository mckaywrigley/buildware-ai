import { savePrompt } from "@/actions/evals/save-codegen-prompt"
import endent from "endent"
import { limitCodebaseTokens } from "../limit-codebase-tokens"

export const buildBasePrompt = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  roleDescription,
  youWillBeGiven,
  goalDescription,
  additionalInstructions,
  extraSections,
  responseInstructions
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
  roleDescription: string
  youWillBeGiven: string
  goalDescription: string
  additionalInstructions: string
  extraSections: string
  responseInstructions: string
}): Promise<string> => {
  const firstPromptSection = basePromptFirstSection(
    roleDescription,
    youWillBeGiven,
    goalDescription
  )

  const codebaseFilesAsText = limitCodebaseTokens(
    firstPromptSection,
    codebaseFiles
  )

  const secondPromptSection = basePromptSecondSection(issue)

  const thirdPromptSection = endent`
      ${additionalInstructions}

      ${instructionsContext}
    </instructions>

    ${
      extraSections
        ? endent`
    ---

    ${extraSections}`
        : ""
    }

    ---

    # Response Instructions

    ${responseInstructions}
  `

  const finalPrompt = endent`
    ${firstPromptSection}

      ${codebaseFilesAsText}

    ${secondPromptSection}

    ${thirdPromptSection}
  `

  // Save the final prompt
  await savePrompt(finalPrompt, issue.name)

  return finalPrompt
}

export const basePromptFirstSection = (
  roleDescription: string,
  youWillBeGiven: string,
  goalDescription: string
) => endent`
  ${roleDescription}

  ${youWillBeGiven}

  ${goalDescription}

  ---

  # Codebase

  The codebase to work with.

  <codebase>`

export const basePromptSecondSection = (issue: {
  name: string
  description: string
}) => endent`
  </codebase>

  ---

  # Task

  The task to complete.

  <task>
    <task_name>${issue.name || "No title provided."}</task_name>
    <task_details>
      ${issue.description || "No details provided."}
    </task_details>
  </task>

  ---

  # Instructions and Guidelines

  The instructions and guidelines for the task. Follow these as you build your plan.

  <instructions>`
