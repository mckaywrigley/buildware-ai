"use client"

import { AIClarificationItem } from "@/types/ai"
import { FC } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { StepLoader } from "./step-loader"

interface ClarifyStepProps {
  clarifications: AIClarificationItem[]
  onUpdateClarifications: (updatedClarifications: AIClarificationItem[]) => void
}

export const ClarifyStep: FC<ClarifyStepProps> = ({
  clarifications,
  onUpdateClarifications
}) => {
  const handleClarificationChange = (index: number, newText: string) => {
    const updatedClarifications = clarifications.map((clarification, i) =>
      i === index ? { ...clarification, text: newText } : clarification
    )
    onUpdateClarifications(updatedClarifications)
  }

  if (clarifications.length === 0) {
    return <StepLoader text="Clarifying..." />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">Clarify</div>
        <div>Edit the AI's clarifications if needed.</div>
      </div>

      {clarifications.map((clarification, index) => (
        <div key={index} className="relative">
          <div className="bg-primary text-primary-foreground absolute -left-8 top-2 flex size-6 items-center justify-center rounded-full text-sm font-semibold">
            {index + 1}
          </div>
          <ReactTextareaAutosize
            className="clarification-text border-border bg-card focus:ring-primary w-full resize-none rounded-lg border p-4 pl-6 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2"
            value={clarification.content}
            onChange={e => handleClarificationChange(index, e.target.value)}
            minRows={2}
            maxRows={10}
          />
        </div>
      ))}
    </div>
  )
}
