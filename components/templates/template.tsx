"use client"

import { SelectInstruction, SelectTemplate } from "@/db/schema"
import { FC } from "react"
import { InstructionAndTemplateView } from "../dashboard/reusable/instruction-and-template-view"

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
    <InstructionAndTemplateView
      item={template}
      type="template"
      attachedInstructions={attachedInstructions}
    />
  )
}
