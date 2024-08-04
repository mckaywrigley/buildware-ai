"use client"

import { ParsedPlan, PlanStep as PlanStepType } from "@/types/run"
import { EditableStep } from "./editable-step"

interface PlanStepProps {
  plan: ParsedPlan
  onUpdatePlan: (updatedPlan: ParsedPlan) => void
}

export const PlanStep = ({ plan, onUpdatePlan }: PlanStepProps) => {
  const handleUpdateItems = (updatedItems: PlanStepType[]) => {
    onUpdatePlan({ ...plan, steps: updatedItems })
  }

  return (
    <EditableStep
      items={plan.steps}
      onUpdateItems={handleUpdateItems}
      title="Plan"
      description="Edit the AI's plans if needed."
      itemName="plan"
    />
  )
}
