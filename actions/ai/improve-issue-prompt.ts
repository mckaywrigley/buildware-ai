"use server"

import { calculateLLMCost } from "@/lib/ai/calculate-llm-cost"
import { BUILDWARE_MAX_OUTPUT_TOKENS } from "@/lib/constants/buildware-config"
import Anthropic from "@anthropic-ai/sdk"
import endent from "endent"

const anthropic = new Anthropic()

export async function improveIssuePrompt(
  startingIssue: {
    name: string
    content: string
  },
  messages: Anthropic.Messages.MessageParam[]
): Promise<ParsedImproveIssueResponse> {
  const improvementModel = "claude-3-5-sonnet-20240620"

  const systemPrompt = endent`
    You are an expert project manager.

    You will be given an issue and a set of improvement instructions.
    
    Your task is to improve the given issue.

    To do this, you will chat back and forth with the user to create the best possible issue.

    An ideal issue:
    - Maintains the issue's original intent.
    - Contains all necessary information and details.
    - Lists specific requirements.
    - Is clear and concise.
    
    Follow these steps for each message:
    1. Carefully read the user's message.
    2. Review the current issue.
    3. Think about the best way to improve the issue.
    4. Apply the improvements to the issue.
    5. Repeat until the issue is done.
  
    ---

    # Starting Issue

    This is the starting issue as provided by the user:

    <starting_issue_name>
    ${startingIssue.name}
    </starting_issue_name>

    <starting_issue_content>
    ${startingIssue.content}
    </starting_issue_content>

    ---

    # Response Instructions

    Follow these instructions for every response.

    ## Response Information

    Respond with the following information:
    - RESPONSE: Enclose your response in <response> tags to help with parsing.
      - IMPROVED_ISSUE: The improved issue.
        - IMPROVED_ISSUE_NAME: The improved issue name.
        - IMPROVED_ISSUE_CONTENT: The improved issue content.
      - MESSAGE: Your message to the user.
        - EXPLANATION: A brief explanation of the improvements made.
        - NEXT_QUESTION: The next question to ask the user.
      - IS_DONE: A boolean indicating if the issue is done. When this is true, the issue is complete and you should stop responding. This will trigger the issue to be created.

    ## Response Format

    Respond in the following format:
    <response>
      <improved_issue>
        <improved_issue_name>__IMPROVED_ISSUE_NAME__</improved_issue_name>
        <improved_issue_content>__IMPROVED_ISSUE_CONTENT__</improved_issue_content>
      </improved_issue>

      <message>
        <explanation>__EXPLANATION_CONTENT__</explanation>

        <next_question>__NEXT_QUESTION__</next_question>
      </message>

      <is_done>__IS_DONE__</is_done>
    </response>
    `

  try {
    const message = await anthropic.messages.create(
      {
        model: improvementModel,
        system: systemPrompt,
        messages,
        max_tokens: BUILDWARE_MAX_OUTPUT_TOKENS
      },
      {
        headers: {
          "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"
        }
      }
    )

    console.warn("improvement usage", message.usage)
    const cost = calculateLLMCost({
      llmId: improvementModel,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens
    })
    console.warn("improvement cost", cost)

    const parsedResponse = parseImproveIssuePrompt(
      message.content[0].type === "text" ? message.content[0].text : ""
    )

    return parsedResponse
  } catch (error) {
    console.error("Error improving issue:", error)
    throw error
  }
}

interface ParsedImproveIssueResponse {
  improvedIssue: {
    name: string
    content: string
  }
  message: {
    explanation: string
    nextQuestion: string
  }
  isDone: boolean
}

const parseImproveIssuePrompt = (
  response: string
): ParsedImproveIssueResponse => {
  const improvedIssueMatch = response.match(
    /<improved_issue>([\s\S]*?)<\/improved_issue>/
  )
  const improvedIssue = improvedIssueMatch ? improvedIssueMatch[1] : ""

  const nameMatch = improvedIssue.match(
    /<improved_issue_name>([\s\S]*?)<\/improved_issue_name>/
  )
  const contentMatch = improvedIssue.match(
    /<improved_issue_content>([\s\S]*?)<\/improved_issue_content>/
  )

  const messageMatch = response.match(/<message>([\s\S]*?)<\/message>/)
  const message = messageMatch ? messageMatch[1] : ""

  const explanationMatch = message.match(
    /<explanation>([\s\S]*?)<\/explanation>/
  )
  const nextQuestionMatch = message.match(
    /<next_question>([\s\S]*?)<\/next_question>/
  )

  const isDoneMatch = response.match(/<is_done>(.*?)<\/is_done>/)

  return {
    improvedIssue: {
      name: nameMatch ? nameMatch[1].trim() : "",
      content: contentMatch ? contentMatch[1].trim() : ""
    },
    message: {
      explanation: explanationMatch ? explanationMatch[1].trim() : "",
      nextQuestion: nextQuestionMatch ? nextQuestionMatch[1].trim() : ""
    },
    isDone: isDoneMatch ? isDoneMatch[1].trim().toLowerCase() === "true" : false
  }
}
