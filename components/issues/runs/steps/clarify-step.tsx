"use client"

import { Button } from "@/components/ui/button"
import { AIClarificationItem } from "@/types/ai"
import { Plus, Trash2 } from "lucide-react"
import { FC, useEffect, useState } from "react"
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
  const [localClarifications, setLocalClarifications] =
    useState<AIClarificationItem[]>(clarifications)

  useEffect(() => {
    setLocalClarifications(clarifications)
  }, [clarifications])

  const handleClarificationChange = (
    index: number,
    field: keyof AIClarificationItem,
    newText: string
  ) => {
    const updatedClarifications = localClarifications.map((item, i) =>
      i === index ? { ...item, [field]: newText } : item
    )
    setLocalClarifications(updatedClarifications)
    onUpdateClarifications(updatedClarifications)
  }

  const handleAddClarification = () => {
    const newClarification: AIClarificationItem = {} as AIClarificationItem
    const updatedClarifications = [...localClarifications, newClarification]
    setLocalClarifications(updatedClarifications)
    onUpdateClarifications(updatedClarifications)
  }

  const handleRemoveClarification = (index: number) => {
    if (localClarifications.length === 1) return // Prevent removing the only item
    const updatedClarifications = localClarifications.filter(
      (_, i) => i !== index
    )
    setLocalClarifications(updatedClarifications)
    onUpdateClarifications(updatedClarifications)
  }

  if (localClarifications.length === 0) {
    return <StepLoader text="Generating clarifications..." />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">Clarify</div>
        <div>Edit the AI's clarifications if needed.</div>
      </div>

      {localClarifications.map((clarification, index) => (
        <div key={index} className="relative flex flex-col gap-2">
          <div className="bg-primary text-primary-foreground absolute -left-8 top-2 flex size-6 items-center justify-center rounded-full text-sm font-semibold">
            {index + 1}
          </div>
          {Object.keys(clarification).map(key => (
            <ReactTextareaAutosize
              key={key}
              className="thought-text border-border bg-card focus:ring-primary w-full resize-none rounded-lg border p-4 pl-6 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2"
              value={clarification[key as keyof AIClarificationItem] as string}
              onChange={e =>
                handleClarificationChange(
                  index,
                  key as keyof AIClarificationItem,
                  e.target.value
                )
              }
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              minRows={2}
              maxRows={5}
            />
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-12 top-2"
            onClick={() => handleRemoveClarification(index)}
            disabled={localClarifications.length === 1}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        className="mt-2 w-full"
        onClick={handleAddClarification}
      >
        <Plus className="mr-2 size-4" />
        Add clarification
      </Button>
    </div>
  )
}
