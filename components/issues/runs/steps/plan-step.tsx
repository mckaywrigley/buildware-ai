"use client"

import { AIPlanStep } from "@/types/ai"
import { EditableStep } from "./editable-step"

interface PlanStepProps {
  plans: AIPlanStep[]
  onUpdatePlans: (updatedPlans: AIPlanStep[]) => void
}

export const PlanStep = ({ plans, onUpdatePlans }: PlanStepProps) => {
  return (
    <EditableStep
      items={plans}
      onUpdateItems={onUpdatePlans}
      title="Plan"
      description="Edit the AI's plans if needed."
      itemName="plan"
    />
  )
}
