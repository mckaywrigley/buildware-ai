"use client"

import { createTemplateRecords } from "@/db/queries/template-queries"
import { useParams, useRouter } from "next/navigation"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { MultiSelect } from "../ui/multi-select"
import { SelectPrompt } from "@/db/schema"
import { useState } from "react"
import { addPromptToTemplate } from "@/db/queries/templates-to-prompts-queries"

interface NewTemplateFormProps {
  prompts: SelectPrompt[]
}

export default function NewTemplateForm({ prompts }: NewTemplateFormProps) {
  const params = useParams()
  const router = useRouter()
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])

  const projectId = params.projectId as string

  const handleCreateTemplate = async (formData: FormData) => {
    const newTemplate = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      projectId
    }
    const template = await createTemplateRecords([newTemplate])

    // Add selected prompts to the template
    for (const promptId of selectedPrompts) {
      await addPromptToTemplate(template[0].id, promptId)
    }

    router.refresh()
    router.push(`../templates/${template[0].id}`)
  }

  return (
    <>
      <div className="mb-4">
        <MultiSelect
          label="Prompt"
          data={prompts.map(prompt => ({ id: prompt.id, name: prompt.title }))}
          selectedIds={selectedPrompts}
          onToggleSelect={setSelectedPrompts}
        />
      </div>
      <CRUDForm
        itemName="Template"
        buttonText="Create"
        onSubmit={handleCreateTemplate}
      />
    </>
  )
}
