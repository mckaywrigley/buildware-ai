"use client"

import { deleteTemplate } from "@/db/queries/templates-queries"
import { SelectInstruction, SelectTemplate } from "@/db/schema"
import { FC } from "react"
import { InstructionTemplateView } from "../dashboard/reusable/instruction-template-view"

interface TemplateProps {
  template: SelectTemplate & {
    templatesToInstructions: {
      templateId: string
      instructionId: string
      instruction: SelectInstruction
    }[]
  }
}

export const Template: FC<TemplateProps> = ({ template }) => {
  const attachedInstructions = template.templatesToInstructions.map(
    ti => ti.instruction
  )

  return (
    <InstructionTemplateView
      item={template}
      type="template"
      onDelete={deleteTemplate}
      attachedInstructions={attachedInstructions}
    />
  )
}
