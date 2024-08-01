"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import { createContextGroup } from "@/db/queries/context-groups-queries"
import { addEmbeddedFileToContextGroup } from "@/db/queries/context-groups-to-embedded-files-queries"
import { SelectEmbeddedFile } from "@/db/schema"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

interface CreateContextGroupProps {
  embeddedFiles: SelectEmbeddedFile[]
}

export const CreateContextGroup = ({
  embeddedFiles
}: CreateContextGroupProps) => {
  const params = useParams()
  const router = useRouter()
  const [name, setName] = useState("")
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])

  const projectId = params.projectId as string

  const handleCreateContextGroup = async () => {
    if (!name) {
      alert("Please enter a name for the context group")
      return
    }

    try {
      const contextGroup = await createContextGroup({ name, projectId })

      for (const fileId of selectedFileIds) {
        await addEmbeddedFileToContextGroup(contextGroup.id, fileId)
      }

      router.refresh()
      router.push(`../context`)
    } catch (error) {
      console.error("Error creating context group:", error)
      alert("An error occurred while creating the context group")
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter context group name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <MultiSelect
        label="Embedded File"
        data={embeddedFiles.map(file => ({
          id: file.id,
          name: file.path
        }))}
        selectedIds={selectedFileIds}
        onToggleSelect={setSelectedFileIds}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleCreateContextGroup}>Create</Button>
      </div>
    </div>
  )
}
