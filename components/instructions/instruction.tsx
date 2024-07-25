"use client"

import { SelectInstruction } from "@/db/schema"
import { FC } from "react"
import { InstructionAndTemplateView } from "../dashboard/reusable/instruction-and-template-view"

interface InstructionsProps {
  instruction: SelectInstruction
}

export const Instruction: FC<InstructionsProps> = ({ instruction }) => {
  return <InstructionAndTemplateView item={instruction} type="instruction" />
}
