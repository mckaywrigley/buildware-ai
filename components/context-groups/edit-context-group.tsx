"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import { updateContextGroup } from "@/db/queries/context-groups-queries"
import {
  addEmbeddedFileToContextGroup,
  getEmbeddedFilesForContextGroup,
  removeEmbeddedFileFromContextGroup
} from "@/db/queries/context-groups-to-embedded-files-queries"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import { SelectContextGroupToEmbeddedFile } from "@/db/schema/context-groups-to-embedded-files-schema"
import { SelectEmbeddedFile } from "@/db/schema/embedded-files-schema"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface EditContextGroupProps {
  contextGroup: SelectContextGroup
  embeddedFiles: (SelectContextGroupToEmbeddedFile & {
    embeddedFile: SelectEmbeddedFile
  })[]
  allEmbeddedFilesInProject: SelectEmbeddedFile[]
}

export const EditContextGroup = ({
  contextGroup,
  embeddedFiles,
  allEmbeddedFilesInProject
}: EditContextGroupProps) => {
  const router = useRouter()
  const [name, setName] = useState(contextGroup.name)
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])

  useEffect(() => {
    const initialSelectedFileIds = embeddedFiles.map(
      file => file.embeddedFileId
    )
    setSelectedFileIds(initialSelectedFileIds)
  }, [embeddedFiles])

  const handleUpdateContextGroup = async () => {
    if (!name) {
      alert("Please enter a name for the context group")
      return
    }

    try {
      await updateContextGroup(contextGroup.id, { name })

      const currentFiles = await getEmbeddedFilesForContextGroup(
        contextGroup.id
      )
      const currentFileIds = currentFiles.map(file => file.embeddedFileId)

      for (const fileId of selectedFileIds) {
        if (!currentFileIds.includes(fileId)) {
          await addEmbeddedFileToContextGroup(contextGroup.id, fileId)
        }
      }

      for (const fileId of currentFileIds) {
        if (!selectedFileIds.includes(fileId)) {
          await removeEmbeddedFileFromContextGroup(contextGroup.id, fileId)
        }
      }

      router.refresh()
      router.back()
    } catch (error) {
      console.error("Error updating context group:", error)
      alert("An error occurred while updating the context group")
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
        data={allEmbeddedFilesInProject.map(file => ({
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
        <Button onClick={handleUpdateContextGroup}>Save</Button>
      </div>
    </div>
  )
}
