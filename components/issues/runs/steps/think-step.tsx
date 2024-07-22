"use client"

import { AIThought } from "@/types/ai"
import { FC } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { StepLoader } from "./step-loader"

interface ThinkStepProps {
  thoughts: AIThought[]
  onUpdateThoughts: (updatedThoughts: AIThought[]) => void
}

export const ThinkStep: FC<ThinkStepProps> = ({
  thoughts,
  onUpdateThoughts
}) => {
  const handleThoughtChange = (index: number, newText: string) => {
    const updatedThoughts = thoughts.map((thought, i) =>
      i === index ? { ...thought, text: newText } : thought
    )
    onUpdateThoughts(updatedThoughts)
  }

  if (thoughts.length === 0) {
    return <StepLoader text="Thinking..." />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">Think</div>
        <div>Edit the AI's thoughts if needed.</div>
      </div>

      {thoughts.map((thought, index) => (
        <div key={thought.number} className="relative">
          <div className="bg-primary text-primary-foreground absolute -left-8 top-2 flex size-6 items-center justify-center rounded-full text-sm font-semibold">
            {thought.number}
          </div>
          <ReactTextareaAutosize
            className="thought-text border-border bg-card focus:ring-primary w-full resize-none rounded-lg border p-4 pl-6 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2"
            value={thought.text}
            onChange={e => handleThoughtChange(index, e.target.value)}
            minRows={2}
            maxRows={10}
          />
        </div>
      ))}
    </div>
  )
}
