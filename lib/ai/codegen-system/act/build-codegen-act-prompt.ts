import endent from "endent"
import { buildBasePrompt } from "../base-codegen-prompts"

export const buildCodegenActPrompt = async ({
  issue,
  codebaseFiles,
  instructionsContext,
  planPrompt
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
  planPrompt: string
}): Promise<{ systemPrompt: string; userMessage: string }> => {
  const systemPrompt = endent`
    You are a world-class software engineer.

    You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, an implementation plan for the task, and response instructions.

    Your goal is to use this information to write all the code needed to complete the given task.
  `

  const { userMessage } = await buildBasePrompt({
    issue,
    codebaseFiles,
    instructionsContext,
    additionalInstructions: "",
    extraSections: endent`
      # Implementation Plan

      A plan to help complete the task.

      <implementation_plan>
        ${planPrompt}
      </implementation_plan>
    `,
    responseInstructions: endent`
      ## Response Information

      Respond with the following information:

      - PULL_REQUEST: Enclose your response in <pull_request> tags to help with parsing.
        - PR_TITLE: The title of the PR.
        - PR_DESCRIPTION: The description of the PR.
        - FILE_LIST: Enclose your response in <file_list> tags to help with parsing.
          - FILE: Each file that is being modified, created, or deleted.
            - FILE_PATH: The full path from the project root, including the file extension.
            - FILE_CONTENT: The complete file content, including all necessary imports, function definitions, and exports.
            - FILE_STATUS: Use 'new' for newly created files, 'modified' for existing files that are being updated, and 'deleted' for files that are being deleted.
          

      ## Response Format

      Generate the full content for each new or modified file.
      
      Only provide the full path for each deleted file.
    
      If you don't need to modify a file, don't include it - this simplifies Git diffs.
    
      Respond in the following format:

      <pull_request>
        <pr_title>__PR_TITLE__</pr_title>
        <pr_description>__PR_DESCRIPTION__</pr_description>
        <file_list>
          <file>
            <file_path>__FILE_PATH__</file_path>
            <file_content>
              __FILE_CONTENT__
            </file_content>
            <file_status>__STATUS__</file_status>
          </file>
        ...
        </file_list>
      </pull_request>
    
      ## Response Example

      An example response:

      <pull_request>
        <pr_title>Add IssueList component</pr_title>
        <pr_description>This PR adds a new IssueList component to display a list of issues.</pr_description>
        <file_list>
          <file>
            <file_path>components/IssueList.tsx</file_path>
            <file_content>
              import React from 'react';
              import { Issue } from '../types';

              interface IssueListProps {
                issues: Issue[];
              }

              export const IssueList: React.FC<IssueListProps> = ({ issues }) => {
                return (
                  <ul>
                    {issues.map((issue) => (
                      <li key={issue.id}>{issue.title}</li>
                    ))}
                  </ul>
                );
              };
            </file_content>
            <file_status>new</file_status>
          </file>
        </file_list>
      </pull_request>

      ## Begin Response

      Now begin your response.
    `
  })

  return { systemPrompt, userMessage }
}
