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
}): Promise<string> => {
  const roleDescription = endent`You are a world-class software engineer.`

  const youWillBeGiven = endent`
  You will be given a codebase to work with, a task to complete, general instructions & guidelines for the task, an implementation plan for the task, and response instructions.`

  const goalDescription = endent`Your goal is to use this information to write all the code needed to complete the given task.`

  const additionalInstructions = endent``

  const extraSections = endent`
    # Implementation Plan

    The plan to use to complete the task.

    <implementation_plan>
      ${planPrompt}
    </implementation_plan>`

  const responseInstructions = endent`
    ## Response Information

    Respond with the following information:

    - FILES: Enclose your response in <files> tags to help with parsing.

    ## Response Format

    Generate the full content for each new or modified file.
    
    Only provide the full path for each deleted file.
  
    If you don't need to modify a file, don't include it - this simplifies Git diffs.
  
    Format your response as follows:
    <file_list>
    FILE_PATH_1
    FILE_PATH_2
    ...
    </file_list>
  
    Then, for each file:
    <file>
    <file_path>__FILE_PATH__</file_path>
    <file_content language="__LANGUAGE__">
    __FILE_CONTENT__
    </file_content>
    <file_status>__STATUS__</file_status>
    </file>
  
    Please adhere to the following guidelines:
  
    FILE_PATH: Use the full path from the project root.
    Example: 'components/Button.tsx'
  
    LANGUAGE: Specify the language or file type. For example:
    'tsx' for .tsx files
    'javascript' for .js files
    'css' for .css files
    'json' for .json files
    etc
  
    FILE_CONTENT: Provide the complete file content, including all necessary imports, function definitions, and exports. Ensure proper indentation.
  
    STATUS: Use 'new' for newly created files, 'modified' for existing files that are being updated, and 'deleted' for files that are being deleted.
  
    Example:
    <file>
    <file_path>components/IssueList.tsx</file_path>
    <file_content language="tsx">
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
  
    Ensure that:
    - The content includes all necessary imports, function definitions, and exports.
    - The code is properly formatted and follows the project's coding standards.
    - Necessary comments for clarity are included if needed.
    - Pseudocode is translated into actual code.
    - You complete all necessary work.
  
    Also provide a PR title:
    <pr_title>
    __PR_TITLE__
    </pr_title>
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
