"use client"

import { deleteTemplate } from "@/db/queries/template-queries"
import { SelectTemplate, SelectPrompt } from "@/db/schema"
import { FC } from "react"
import { PromptTemplateView } from "../dashboard/reusable/prompt-template-view"

interface TemplateProps {
  template: SelectTemplate & {
    templatesToPrompts: {
      templateId: string
      promptId: string
      prompt: SelectPrompt
    }[]
  }
}

export const Template: FC<TemplateProps> = ({ template }) => {
  const attachedPrompts = template.templatesToPrompts.map(tp => tp.prompt)

  return (
    <PromptTemplateView
      item={template}
      type="template"
      onDelete={deleteTemplate}
      attachedPrompts={attachedPrompts}
    />
  )
}
