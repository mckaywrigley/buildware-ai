"use client"

import {
  deleteInstruction,
  updateInstruction
} from "@/db/queries/instructions-queries"
import { SelectInstruction } from "@/db/schema"
import { useRouter } from "next/navigation"
import { CRUDForm } from "../dashboard/reusable/crud-form"

export const EditInstruction = ({
  instruction
}: {
  instruction: SelectInstruction
}) => {
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

  const handleDeleteInstruction = async () => {
    await deleteInstruction(instruction.id)
    router.refresh()
    router.push(`../${instruction.id}`)
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
      onDelete={handleDeleteInstruction}
    />
  )
}
