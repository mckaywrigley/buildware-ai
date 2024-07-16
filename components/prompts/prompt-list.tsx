"use client"

import { deletePrompt } from "@/db/queries/prompt-queries"
import { SelectPrompt } from "@/db/schema"
import { FC } from "react"
import { DataItem } from "../dashboard/reusable/data-item"
import { DataList } from "../dashboard/reusable/data-list"

interface PromptsListProps {
  prompts: SelectPrompt[]
}

export const PromptsList: FC<PromptsListProps> = ({ prompts }) => {
  const handleDelete = async (id: string) => {
    await deletePrompt(id)
  }
  return (
    <DataList
      title="Prompts"
      subtitle="Manage prompts"
      readMoreLink="#"
      readMoreText="Read more"
      createLink={`./prompts/create`}
      createText="Create prompt"
      description="Prompt description here"
      dataListTitle="Prompts"
    >
      {prompts.length > 0 ? (
        prompts.map(prompt => (
          <DataItem
            key={prompt.id}
            data={prompt}
            type="prompts"
            onDelete={handleDelete}
          />
        ))
      ) : (
        <div>No prompts found.</div>
      )}
    </DataList>
  )
}
