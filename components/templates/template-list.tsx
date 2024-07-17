"use client"

import { deleteTemplate } from "@/db/queries/templates-queries"
import { SelectInstruction, SelectTemplate } from "@/db/schema"
import { FC } from "react"
import { DataItem } from "../dashboard/reusable/data-item"
import { DataList } from "../dashboard/reusable/data-list"

interface TemplatesListProps {
  templatesWithInstructions: (SelectTemplate & {
    templatesToInstructions: {
      templateId: string
      instructionId: string
      instruction: SelectInstruction
    }[]
  })[]
  instructions: SelectInstruction[]
  projectId: string
}

export const TemplatesList: FC<TemplatesListProps> = ({
  templatesWithInstructions
}) => {
  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id)
  }
  return (
    <DataList
      title="Templates"
      subtitle="Manage templates"
      readMoreLink="https://docs.buildware.ai/core-components/templates"
      readMoreText="Read more"
      createLink={`./templates/create`}
      createText="Create template"
      dataListTitle="Templates"
    >
      {templatesWithInstructions.length > 0 ? (
        templatesWithInstructions.map(templateWithInstruction => (
          <DataItem
            key={templateWithInstruction.id}
            data={templateWithInstruction}
            type="templates"
            onDelete={handleDeleteTemplate}
          />
        ))
      ) : (
        <div>No templates found.</div>
      )}
    </DataList>
  )
}
