"use client"

import { createInstructionRecords } from "@/db/queries/instructions-queries"
import { useParams, useRouter } from "next/navigation"
import { CRUDForm } from "../dashboard/reusable/crud-form"

export default function NewInstructionForm() {
  const params = useParams()
  const router = useRouter()

  const projectId = params.projectId as string

  const handleCreateInstruction = async (formData: FormData) => {
    const newInstruction = {
      name: formData.get("name") as string,
      content: formData.get("content") as string,
      projectId
    }
    const instruction = await createInstructionRecords([newInstruction])
    router.refresh()
    router.push(`../instructions/${instruction[0].id}`)
  }

  return (
    <CRUDForm
      itemName="Instruction"
      buttonText="Create"
      onSubmit={handleCreateInstruction}
    />
  )
}
