"use client"

import { deleteTemplate } from "@/db/queries/template-queries"
import { SelectTemplate } from "@/db/schema"
import { FC } from "react"
import { PromptTemplateView } from "../dashboard/reusable/prompt-template-view"

interface TemplateProps {
  template: SelectTemplate
}

export const Template: FC<TemplateProps> = ({ template }) => {
  return (
    <PromptTemplateView
      item={template}
      type="template"
      onDelete={deleteTemplate}
    />
  )
}
