"use client"

import { ParsedPlan, PlanStep as PlanStepType } from "@/types/run"
import { EditableStep } from "./editable-step"

interface PlanStepProps {
  parsedPlan: ParsedPlan
  onUpdateParsedPlan: (updatedParsedPlan: ParsedPlan) => void
}

export const PlanStep = ({ parsedPlan, onUpdateParsedPlan }: PlanStepProps) => {
  const handleUpdateItems = (updatedItems: PlanStepType[]) => {
    onUpdateParsedPlan({ ...parsedPlan, steps: updatedItems })
  }

  return (
    <EditableStep
      items={parsedPlan.steps}
      onUpdateItems={handleUpdateItems}
      title="Plan"
      description="Edit the AI's plans if needed."
      itemName="plan"
    />
  )
}
