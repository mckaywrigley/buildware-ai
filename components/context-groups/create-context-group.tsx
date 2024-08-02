"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createContextGroup } from "@/db/queries/context-groups-queries"
import { addEmbeddedFileToContextGroup } from "@/db/queries/context-groups-to-embedded-files-queries"
import { getEmbeddedFilesAndFolders } from "@/db/queries/embedded-files-queries"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ContextMultiSelect } from "./context-multi-select"

interface CreateContextGroupProps {
  embeddedFiles: Awaited<ReturnType<typeof getEmbeddedFilesAndFolders>>
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

      const selectedFiles = embeddedFiles.filter(
        file => file.type === "file" && selectedFileIds.includes(file.id)
      )

      for (const file of selectedFiles) {
        await addEmbeddedFileToContextGroup(contextGroup.id, file.id)
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

      <ContextMultiSelect
        label="Embedded File or Folder"
        data={embeddedFiles.map(item => ({
          id: item.id,
          name: item.path,
          type: item.type,
          path: item.path
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
