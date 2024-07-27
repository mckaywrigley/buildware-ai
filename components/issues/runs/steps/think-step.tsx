"use client"

import { AIThought } from "@/types/ai"
import { EditableStep } from "./editable-step"

interface ThinkStepProps {
  thoughts: AIThought[]
  onUpdateThoughts: (updatedThoughts: AIThought[]) => void
}

export const ThinkStep = ({ thoughts, onUpdateThoughts }: ThinkStepProps) => {
  return (
    <EditableStep
      items={thoughts}
      onUpdateItems={onUpdateThoughts}
      title="Think"
      description="Edit, remove, or add new thoughts as needed."
      itemName="thought"
    />
  )
}
