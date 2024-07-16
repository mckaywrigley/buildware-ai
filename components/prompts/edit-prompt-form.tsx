"use client"

import { updatePrompt } from "@/db/queries/prompt-queries"
import { SelectPrompt } from "@/db/schema"
import { useRouter } from "next/navigation"
import { CRUDForm } from "../dashboard/reusable/crud-form"

export default function EditPromptForm({ prompt }: { prompt: SelectPrompt }) {
  const router = useRouter()

  const handleUpdatePrompt = async (formData: FormData) => {
    try {
      const updatedPrompt = {
        title: formData.get("title") as string,
        content: formData.get("content") as string
      }
      await updatePrompt(prompt.id, updatedPrompt)
      router.refresh()
      router.push(`../${prompt.id}`)
    } catch (error) {
      console.error("Failed to update prompt:", error)
    }
  }

  return (
    <CRUDForm
      itemName="Prompt"
      buttonText="Save"
      onSubmit={handleUpdatePrompt}
      data={{
        title: prompt.title,
        content: prompt.content
      }}
    />
  )
}
