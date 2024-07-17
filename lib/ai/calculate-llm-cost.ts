export const calculateLLMCost = ({
  llmId,
  inputTokens,
  outputTokens
}: {
  llmId: string
  inputTokens: number
  outputTokens: number
}) => {
  const LLMS = [
    // Anthropic
    {
      name: "Claude 3.5 Sonnet",
      id: "claude-3-5-sonnet-20240620",
      inputCost: 3,
      outputCost: 15
    },
    {
      name: "Claude 3.5 Haiku",
      id: "claude-3-haiku-20240307",
      inputCost: 0.25,
      outputCost: 1.25
    },
    // OpenAI
    {
      name: "GPT-4 Omni",
      id: "gpt-4o",
      inputCost: 5,
      outputCost: 15
    },
    {
      name: "GPT-4 Turbo",
      id: "gpt-4-turbo",
      inputCost: 10,
      outputCost: 30
    },
    {
      name: "GPT-3.5 Turbo",
      id: "gpt-3.5-turbo",
      inputCost: 0.5,
      outputCost: 1.5
    },
    // Google
    {
      name: "Gemini 1.5 Pro",
      id: "models/gemini-1.5-pro-latest",
      inputCost: 3.5,
      outputCost: 10.5
    }
  ]

  const llm = LLMS.find(llm => llm.id === llmId)
  if (!llm) {
    return 0 // Skip if LLM not found
  }

  const inputCost = (inputTokens / 1_000_000) * llm.inputCost
  const outputCost = (outputTokens / 1_000_000) * llm.outputCost
  const totalCost = inputCost + outputCost

  // Cost in USD
  console.warn(`Total cost for ${llm.name}: $${totalCost.toFixed(6)}`)
  return parseFloat(totalCost.toFixed(6))
}
