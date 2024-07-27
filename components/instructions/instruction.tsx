"use client"

import { SelectInstruction } from "@/db/schema"
import { InstructionAndTemplateView } from "../dashboard/reusable/instruction-and-template-view"

interface InstructionsProps {
  instruction: SelectInstruction
}

export const Instruction = ({ instruction }: InstructionsProps) => {
  return <InstructionAndTemplateView item={instruction} type="instruction" />
}
