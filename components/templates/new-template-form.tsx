"use client"

import { createTemplateRecords } from "@/db/queries/template-queries"
import { useParams, useRouter } from "next/navigation"
import { CRUDForm } from "../dashboard/reusable/crud-form"

export default function NewTemplateForm({}: {}) {
  const params = useParams()
  const router = useRouter()

  const projectId = params.projectId as string

  const handleCreateTemplate = async (formData: FormData) => {
    const newTemplate = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      projectId
    }
    const template = await createTemplateRecords([newTemplate])
    router.refresh()
    router.push(`../templates/${template[0].id}`)
  }

  return (
    <CRUDForm
      itemName="Template"
      buttonText="Create"
      onSubmit={handleCreateTemplate}
    />
  )
}
