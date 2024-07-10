"use client"

import { createPromptRecords } from "@/db/queries/prompt-queries"
import { useParams, useRouter } from "next/navigation"
import { CRUDForm } from "../dashboard/reusable/crud-form"

export default function NewPromptForm() {
  const params = useParams()
  const router = useRouter()

  const projectId = params.projectId as string

  const handleCreatePrompt = async (formData: FormData) => {
    const newPrompt = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      projectId
    }
    const prompt = await createPromptRecords([newPrompt])
    router.refresh()
    router.push(`../prompts/${prompt[0].id}`)
  }

  return (
    <CRUDForm
      itemName="Prompt"
      buttonText="Create"
      onSubmit={handleCreatePrompt}
    />
  )
}
