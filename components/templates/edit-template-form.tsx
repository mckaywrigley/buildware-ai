"use client"

import { updateTemplate } from "@/db/queries/template-queries"
import { SelectPrompt, SelectTemplate } from "@/db/schema"
import { useRouter } from "next/navigation"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { TemplateSelect } from "./template-select"

export default function EditTemplateForm({
  prompts,
  templateWithPrompts
}: {
  prompts: SelectPrompt[]
  templateWithPrompts: SelectTemplate & {
    templatesToPrompts: {
      templateId: string
      promptId: string
      prompt: SelectPrompt
    }[]
  }
}) {
  const router = useRouter()

  const handleUpdateTemplate = async (formData: FormData) => {
    try {
      const updatedTemplate = {
        title: formData.get("title") as string,
        content: formData.get("content") as string
      }
      await updateTemplate(
        templateWithPrompts.id,
        updatedTemplate,
        templateWithPrompts.projectId
      )
      router.refresh()
      router.push(
        `/${templateWithPrompts.projectId}/templates/${templateWithPrompts.id}`
      )
    } catch (error) {
      console.error("Failed to update prompt:", error)
    }
  }

  return (
    <>
      <TemplateSelect
        prompts={prompts}
        templateWithPrompts={templateWithPrompts}
      />

      <CRUDForm
        itemName="Template"
        buttonText="Save"
        onSubmit={handleUpdateTemplate}
        data={{
          title: templateWithPrompts.title,
          content: templateWithPrompts.content
        }}
      />
    </>
  )
}
