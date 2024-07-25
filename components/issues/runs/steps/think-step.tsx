"use client"

import { AIThought } from "@/types/ai"
import { FC } from "react"
import { EditableStep } from "./editable-step"

interface ThinkStepProps {
  thoughts: AIThought[]
  onUpdateThoughts: (updatedThoughts: AIThought[]) => void
}

export const ThinkStep: FC<ThinkStepProps> = ({
  thoughts,
  onUpdateThoughts
}) => {
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
