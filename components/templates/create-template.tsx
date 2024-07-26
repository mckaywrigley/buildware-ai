"use client"

import { createTemplateRecords } from "@/db/queries/templates-queries"
import { addInstructionToTemplate } from "@/db/queries/templates-to-instructions-queries"
import { SelectInstruction } from "@/db/schema"
import { useParams, useRouter } from "next/navigation"
import { FC, useState } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { MultiSelect } from "../ui/multi-select"

interface NewTemplateProps {
  instructions: SelectInstruction[]
}

export const CreateTemplate: FC<NewTemplateProps> = ({ instructions }) => {
  const params = useParams()
  const router = useRouter()
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([])

  const projectId = params.projectId as string

  const handleCreateTemplate = async (formData: FormData) => {
    const newTemplate = {
      name: formData.get("name") as string,
      content: formData.get("content") as string,
      projectId
    }
    const template = await createTemplateRecords([newTemplate])

    // Add selected instructions to the template
    for (const instructionId of selectedInstructions) {
      await addInstructionToTemplate(template[0].id, instructionId)
    }

    router.refresh()
    router.push(`../templates/${template[0].id}`)
  }

  return (
    <>
      <div className="mb-4">
        <MultiSelect
          label="Instruction"
          data={instructions.map(instruction => ({
            id: instruction.id,
            name: instruction.name
          }))}
          selectedIds={selectedInstructions}
          onToggleSelect={setSelectedInstructions}
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