"use client"

import { AIThought } from "@/types/ai"
import { FC } from "react"
import { EditableStep } from "./editable-step"

interface ThinkStepProps {
  thoughts: AIThought[]
  onUpdateThoughts: (updatedThoughts: AIThought[]) => void
  onNextStep: () => void
}

export const ThinkStep: FC<ThinkStepProps> = ({
  thoughts,
  onUpdateThoughts,
  onNextStep
}) => {
  return (
    <EditableStep
      items={thoughts}
      onUpdateItems={onUpdateThoughts}
      title="Think"
      description="Edit, remove, or add new thoughts as needed."
      itemName="thought"
      onNextStep={onNextStep}
    />
  )
}
