"use client"

import { AIPlanStep } from "@/types/ai"
import { FC } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { StepLoader } from "./step-loader"

interface PlanStepProps {
  plans: AIPlanStep[]
  onUpdatePlans: (updatedPlans: AIPlanStep[]) => void
}

export const PlanStep: FC<PlanStepProps> = ({ plans, onUpdatePlans }) => {
  const handlePlanChange = (index: number, newText: string) => {
    const updatedPlans = plans.map((plan, i) =>
      i === index ? { ...plan, text: newText } : plan
    )
    onUpdatePlans(updatedPlans)
  }

  if (plans.length === 0) {
    return <StepLoader text="Planning..." />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">Plan</div>
        <div>Edit the AI's plans if needed.</div>
      </div>

      {plans.map((plan, index) => (
        <div key={plan.number} className="relative">
          <div className="bg-primary text-primary-foreground absolute -left-8 top-2 flex size-6 items-center justify-center rounded-full text-sm font-semibold">
            {plan.number}
          </div>
          <ReactTextareaAutosize
            className="plan-text border-border bg-card focus:ring-primary w-full resize-none rounded-lg border p-4 pl-6 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2"
            value={plan.text}
            onChange={e => handlePlanChange(index, e.target.value)}
            minRows={2}
            maxRows={10}
          />
        </div>
      ))}
    </div>
  )
}
