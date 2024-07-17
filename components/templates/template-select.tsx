"use client"

import { SelectInstruction, SelectTemplate } from "@/db/schema"
import { useState } from "react"
import { MultiSelect } from "../ui/multi-select"
import { updateTemplateInstructions } from "./handle-save"

interface TemplateSelectProps {
  instructions: SelectInstruction[]
  templateWithInstructions: SelectTemplate & {
    templatesToInstructions: {
      templateId: string
      instructionId: string
      instruction: SelectInstruction
    }[]
  }
}

export function TemplateSelect({
  instructions,
  templateWithInstructions
}: TemplateSelectProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>()

  if (!instructions || instructions.length === 0) {
    return <div>No instructions selected for this template</div>
  }

  const handleSelect = async (ids: string[]) => {
    setSelectedIds(ids)
    await updateTemplateInstructions(templateWithInstructions.id, ids)
  }

  return (
    <MultiSelect
      label="instruction"
      data={instructions.map(instruction => ({
        id: instruction.id,
        name: instruction.name
      }))}
      selectedIds={
        selectedIds ||
        templateWithInstructions.templatesToInstructions.map(
          t => t.instructionId
        )
      }
      onToggleSelect={handleSelect}
    />
  )
}
