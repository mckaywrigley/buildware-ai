import endent from "endent"
import { limitTokens } from "./limit-tokens"

export const buildCodeGenPrompt = async ({
  issue,
  codebaseFiles,
  plan,
  instructionsContext
}: {
  issue: {
    title: string
    description: string
  }
  codebaseFiles: {
    path: string
    content: string
  }[]
  plan: string
  instructionsContext: string
}): Promise<string> => {
  const basePrompt = endent`
    # AI Expert Developer
  
    You are an expert developer who is tasked with implementing a given task.
  
    You will be given a task, a codebase, instructions, and an implementation plan.
    
    Your goal is to write all the code needed to complete the given task, ensuring it integrates well with the existing codebase and follows best practices.
  
    Use the plan to guide your implementation. It may or may not be complete, so double-check your work as you go.
  
    Note: Focus solely on the technical implementation. Ignore any mentions of human tasks or non-technical aspects.
  
    Encoded in XML tags, here is what you will be given:
  
    TASK: Context about the task to complete.
    INSTRUCTIONS: Instructions on how to complete the task.
    CODEBASE: Files from the codebase you have access to.
    IMPLEMENTATION_PLAN: A detailed implementation plan for the given issue.
    FORMAT: Instructions for how to format your response.
  
    ---
    
    # Task
  
    <task>
      
    # Title
    ${issue.title ?? "No title."}
  
    ## Description
    ${issue.description ?? "No description."}
  
    </task>
  
    ---
  
    # Codebase
  
    <codebase>
    `

  const formatInstructions = `
    </codebase>
  
    ---
  
    # Instructions
  
    <instructions>
  
    Follow these instructions:
  
    ${instructionsContext}
  
    </instructions>
  
    ---
  
    # Implementation Plan
  
    <implementation_plan>
  
    ${plan}
  
    </implementation_plan>
  
    ---
  
    # Format
  
    <format>
  
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
  
    </format>
    `

  const { prompt, tokensUsed } = limitTokens(basePrompt, codebaseFiles)
  const finalPrompt = `${prompt}${formatInstructions}`
  console.warn(`Code Gen Prompt: Tokens used: ${tokensUsed}`)

  return finalPrompt
}
