"use client"

import { deleteInstruction } from "@/db/queries/instructions-queries"
import { SelectInstruction } from "@/db/schema"
import { FC } from "react"
import { InstructionTemplateView } from "../dashboard/reusable/instruction-template-view"

interface InstructionsProps {
  instruction: SelectInstruction
}

export const Instruction: FC<InstructionsProps> = ({ instruction }) => {
  return (
    <InstructionTemplateView
      item={instruction}
      type="instruction"
      onDelete={deleteInstruction}
    />
  )
}
