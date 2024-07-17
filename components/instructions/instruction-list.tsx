"use client"

import { deleteInstruction } from "@/db/queries/instructions-queries"
import { SelectInstruction } from "@/db/schema"
import { FC } from "react"
import { DataItem } from "../dashboard/reusable/data-item"
import { DataList } from "../dashboard/reusable/data-list"

interface InstructionsListProps {
  instructions: SelectInstruction[]
}

export const InstructionsList: FC<InstructionsListProps> = ({
  instructions
}) => {
  const handleDelete = async (id: string) => {
    await deleteInstruction(id)
  }
  return (
    <DataList
      title="Instructions"
      subtitle="Manage instructions"
      readMoreLink="#"
      readMoreText="Read more"
      createLink={`./instructions/create`}
      createText="Create instruction"
      description="Instruction description here"
      dataListTitle="Instructions"
    >
      {instructions.length > 0 ? (
        instructions.map(instruction => (
          <DataItem
            key={instruction.id}
            data={instruction}
            type="instructions"
            onDelete={handleDelete}
          />
        ))
      ) : (
        <div>No instructions found.</div>
      )}
    </DataList>
  )
}
