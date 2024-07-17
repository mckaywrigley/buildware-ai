import endent from "endent"
import { limitTokens } from "./limit-tokens"

export const buildCodePlanPrompt = async ({
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
  const basePrompt = endent`
        # AI Task Planning Assistant
    
        You are an AI specialized in creating detailed implementation plans for coding tasks.
    
        You will be given a task, codebase, and instructions.
        
        Your goal is to break down the given issue into clear, actionable steps that another developer can follow to complete the task.
        
        Create a detailed implementation plan for the given issue. Your plan should:
    
        - Stick to the task at hand.
        - Break down the task into clear, logical steps.
        - Ensure the plan is detailed enough to allow another developer to implement the task.
        - Be 100% correct and complete.
    
        Note: Focus solely on the technical implementation. Ignore any mentions of human tasks or non-technical aspects.
    
        Encoded in XML tags, here is what you will be given:
    
        TASK: Information about the task.
        CODEBASE: Files from the codebase.
        INSTRUCTIONS: Instructions and guidelines on how to complete the task.
        FORMAT: Instructions on how to format your response.
    
        ---
    
        # Task
    
        <task>
    
        # Title
        ${issue.name ?? "No title."}
    
        ## Description
        ${issue.description ?? "No description."}
    
        </task>
    
        ---
    
        # Codebase
    
        <codebase>
      `

  const formatInstructions = endent`
        </codebase>
    
        ---
    
        # Instructions
    
        <instructions>
    
        Follow these instructions:
    
        ${instructionsContext}
    
        </instructions>
    
        ---
    
        # Format
    
        <format>
    
        Format your response as follows:
    
        1. Present your plan as a numbered list of steps.
        2. Use markdown formatting.
    
        </format>
      `

  const { prompt, tokensUsed } = limitTokens(basePrompt, codebaseFiles)
  const finalPrompt = `${prompt}\n${formatInstructions}`
  console.warn(`Code Plan Prompt: Tokens used: ${tokensUsed}`)

  return finalPrompt
}
