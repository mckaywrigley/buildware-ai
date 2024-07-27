"use client"

import { SelectInstruction, SelectTemplate } from "@/db/schema"
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

export const Template = ({ template }: TemplateProps) => {
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
