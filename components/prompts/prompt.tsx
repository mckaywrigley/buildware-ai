"use client"

import { deletePrompt } from "@/db/queries/prompt-queries"
import { SelectPrompt } from "@/db/schema"
import { FC } from "react"
import { PromptTemplateView } from "../dashboard/reusable/prompt-template-view"

interface PromptsProps {
  prompt: SelectPrompt
}

export const Prompt: FC<PromptsProps> = ({ prompt }) => {
  return (
    <PromptTemplateView item={prompt} type="prompt" onDelete={deletePrompt} />
  )
}
