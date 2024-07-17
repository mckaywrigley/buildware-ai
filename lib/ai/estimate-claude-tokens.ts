import { encode } from "gpt-tokenizer"

export function estimateClaudeSonnet3_5TokenCount(text: string): number {
  // Claude tokenizer is ~1.25-1.35 times more expensive than GPT, using 1.4 to be safe
  return encode(text).length * 1.4
}
