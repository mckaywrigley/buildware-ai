import { savePrompt } from "@/actions/evals/save-codegen-prompt"
import endent from "endent"
import { limitCodebaseTokens } from "../limit-codebase-tokens"

export const buildBasePrompt = async ({
  step,
  issue,
  codebaseFiles,
  instructionsContext,
  additionalInstructions,
  extraSections,
  responseInstructions
}: {
  step: "think" | "plan" | "act"
  issue: {
    name: string
    description: string
  }
  codebaseFiles: {
    path: string
    content: string
  }[]
  instructionsContext: string
  additionalInstructions: string
  extraSections: string
  responseInstructions: string
}): Promise<{ systemPrompt: string; userMessage: string }> => {
  const codebaseSection = endent`
    # Codebase

    The codebase to work with.

    <codebase>
      ${limitCodebaseTokens("", codebaseFiles)}
    </codebase>
  `

  const taskSection = endent`
    # Task

    The task to complete.

    <task>
      <task_name>${issue.name || "No title provided."}</task_name>
      <task_details>
        ${issue.description || "No details provided."}
      </task_details>
    </task>
  `

  const instructionsSection = endent`
    # Instructions and Guidelines

    The instructions and guidelines for the task. Follow these as you build your plan.

    <instructions>
      ${additionalInstructions}

      ${instructionsContext || "No additional instructions provided."}
    </instructions>
    ${extraSections ? `\n\n---\n\n${extraSections}` : ""}
  `

  const responseSection = endent`
    # Response Instructions

    ${responseInstructions}
  `

  const userMessage = endent`
    ${codebaseSection}

    ---

    ${taskSection}

    ---

    ${instructionsSection}

    ---

    ${responseSection}
  `

  // Save the final prompt
  await savePrompt(userMessage, issue.name, step, "prompt")

  return { systemPrompt: "", userMessage }
}
