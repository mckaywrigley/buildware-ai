import endent from "endent"
import { buildBasePrompt } from "../base-codegen-prompts"

export const buildCodegenClarifyPrompt = async ({
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

    Your goal is to clarify the task, eliminate any ambiguity, and determine if you have all the information you need to complete it.
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

      - CLARIFICATIONS: Enclose your response in <clarifications> tags to help with parsing.
        - ITEM: An individual clarification item.
          - TYPE: The type of clarification. Possible types include:
            - "question": A general question requiring a text response
            - "confirmation": A yes/no or multiple choice question
            - "file_request": Request for a specific file's content
            - "info_request": Request for additional information
            - "priority": Ask about the priority or importance of a task or feature
            - "timeline": Inquire about project timeline or deadlines
            - "dependency": Ask about dependencies or prerequisites
            - "constraint": Clarify any constraints or limitations
            - "scope": Define or clarify the scope of the task
            - "technical_details": Request specific technical information
            - "user_story": Ask for a user story or use case
            - "acceptance_criteria": Request or clarify acceptance criteria
            - "resource": Inquire about available resources or tools
          - CONTENT: The content of the clarification item.
          - OPTIONS: (Optional) Possible options for user selection, if applicable.

      ## Response Format

      Respond in the following format:

      <clarifications>
        <item>
          <type>__ITEM_TYPE__</type>
          <content>__ITEM_CONTENT__</content>
          <options>
            <option>__OPTION_1__</option>
            <option>__OPTION_2__</option>
            ...
          </options>
        </item>
        ...
      </clarifications>

      ## Response Example

      An example response:

      <clarifications>
        <item>
          <type>question</type>
          <content>What specific programming language should be used for this task?</content>
        </item>
        <item>
          <type>confirmation</type>
          <content>Is the task limited to modifying existing files, or can new files be created?</content>
          <options>
            <option>Modify existing files only</option>
            <option>Can create new files</option>
          </options>
        </item>
        <item>
          <type>file_request</type>
          <content>Please provide the content of the main configuration file for the project.</content>
        </item>
        <item>
          <type>priority</type>
          <content>How critical is this feature for the upcoming release?</content>
          <options>
            <option>Critical - must have</option>
            <option>Important - should have</option>
            <option>Nice to have</option>
          </options>
        </item>
        <item>
          <type>timeline</type>
          <content>What is the expected deadline for this task?</content>
        </item>
        <item>
          <type>dependency</type>
          <content>Are there any other tasks or features that need to be completed before starting this one?</content>
        </item>
        <item>
          <type>constraint</type>
          <content>Are there any performance or resource constraints we need to be aware of?</content>
        </item>
        <item>
          <type>scope</type>
          <content>Should this feature be implemented for all user types or only for admin users?</content>
          <options>
            <option>All users</option>
            <option>Admin users only</option>
          </options>
        </item>
        <item>
          <type>technical_details</type>
          <content>What database system is currently in use for this project?</content>
        </item>
        <item>
          <type>user_story</type>
          <content>Can you provide a user story that describes the main use case for this feature?</content>
        </item>
        <item>
          <type>acceptance_criteria</type>
          <content>What are the key acceptance criteria for considering this task complete?</content>
        </item>
        <item>
          <type>resource</type>
          <content>Are there any specific tools or libraries that should be used for this task?</content>
        </item>
      </clarifications>

      ## Begin Response

      Now begin your response, focusing on clarifying the task and gathering necessary information.
    `
  })

  return { systemPrompt, userMessage }
}
