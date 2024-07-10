"use client"

import { deleteTemplate } from "@/db/queries/template-queries"
import { SelectPrompt, SelectTemplate } from "@/db/schema"
import { FC } from "react"
import { DataItem } from "../dashboard/reusable/data-item"
import { DataList } from "../dashboard/reusable/data-list"

interface TemplatesListProps {
  templatesWithPrompts: (SelectTemplate & {
    templatesToPrompts: {
      templateId: string
      promptId: string
      prompt: SelectPrompt
    }[]
  })[]
  prompts: SelectPrompt[]
  projectId: string
}

export const TemplatesList: FC<TemplatesListProps> = ({
  templatesWithPrompts
}) => {
  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id)
  }
  return (
    <DataList
      title="Templates"
      subtitle="Manage templates"
      readMoreLink="#"
      readMoreText="Read more"
      createLink={`./templates/create`}
      createText="Create template"
      description="Template description here"
      dataListTitle="Templates"
    >
      {templatesWithPrompts.length > 0 ? (
        templatesWithPrompts.map(templateWithPrompt => (
          <DataItem
            key={templateWithPrompt.id}
            data={templateWithPrompt}
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
