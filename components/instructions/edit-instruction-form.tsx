"use client"

import { updateInstruction } from "@/db/queries/instructions-queries"
import { SelectInstruction } from "@/db/schema"
import { useRouter } from "next/navigation"
import { CRUDForm } from "../dashboard/reusable/crud-form"

export default function EditInstructionForm({
  instruction
}: {
  instruction: SelectInstruction
}) {
  const router = useRouter()

  const handleUpdateInstruction = async (formData: FormData) => {
    try {
      const updatedInstruction = {
        title: formData.get("title") as string,
        content: formData.get("content") as string
      }
      await updateInstruction(instruction.id, updatedInstruction)
      router.refresh()
      router.push(`../${instruction.id}`)
    } catch (error) {
      console.error("Failed to update instruction:", error)
    }
  }

  return (
    <CRUDForm
      itemName="Instruction"
      buttonText="Save"
      onSubmit={handleUpdateInstruction}
      data={{
        name: instruction.name,
        content: instruction.content
      }}
    />
  )
}
