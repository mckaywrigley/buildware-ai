"use client"

import { updateTemplate } from "@/db/queries/templates-queries"
import { SelectInstruction, SelectTemplate } from "@/db/schema"
import { useRouter } from "next/navigation"
import { FC } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { TemplateSelect } from "./template-select"

interface EditTemplateProps {
  instructions: SelectInstruction[]
  templateWithInstructions: SelectTemplate & {
    templatesToInstructions: {
      templateId: string
      instructionId: string
      instruction: SelectInstruction
    }[]
  }
}

export const EditTemplate: FC<EditTemplateProps> = ({
  instructions,
  templateWithInstructions
}) => {
  const router = useRouter()

  const handleUpdateTemplate = async (formData: FormData) => {
    try {
      const updatedTemplate = {
        title: formData.get("title") as string,
        content: formData.get("content") as string
      }
      await updateTemplate(
        templateWithInstructions.id,
        updatedTemplate,
        templateWithInstructions.projectId
      )
      router.refresh()
      router.push(`../${templateWithInstructions.id}`)
    } catch (error) {
      console.error("Failed to update instruction:", error)
    }
  }

  return (
    <>
      <div className="mb-4">
        <TemplateSelect
          instructions={instructions}
          templateWithInstructions={templateWithInstructions}
        />
      </div>

      <CRUDForm
        itemName="Template"
        buttonText="Save"
        onSubmit={handleUpdateTemplate}
        data={{
          name: templateWithInstructions.name,
          content: templateWithInstructions.content
        }}
      />
    </>
  )
}
