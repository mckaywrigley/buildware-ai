"use client"

import { SelectPrompt, SelectTemplate } from "@/db/schema"
import { useState } from "react"
import { MultiSelect } from "../ui/multi-select"
import { updateTemplatePrompts } from "./handle-save"

interface TemplateSelectProps {
  prompts: SelectPrompt[]
  templateWithPrompts: SelectTemplate & {
    templatesToPrompts: {
      templateId: string
      promptId: string
      prompt: SelectPrompt
    }[]
  }
}

export function TemplateSelect({
  prompts,
  templateWithPrompts
}: TemplateSelectProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>()

  if (!prompts || prompts.length === 0) {
    return <div>No prompts selected for this template</div>
  }

  const handleSelect = async (ids: string[]) => {
    setSelectedIds(ids)
    await updateTemplatePrompts(templateWithPrompts.id, ids)
  }

  return (
    <MultiSelect
      label="prompt"
      data={prompts.map(prompt => ({
        id: prompt.id,
        name: prompt.title
      }))}
      selectedIds={
        selectedIds ||
        templateWithPrompts.templatesToPrompts.map(t => t.promptId)
      }
      onToggleSelect={handleSelect}
    />
  )
}
