"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deleteContextGroup,
  updateContextGroup
} from "@/db/queries/context-groups-queries"
import {
  addEmbeddedFilesToContextGroup,
  getEmbeddedFilesForContextGroup,
  removeEmbeddedFilesFromContextGroup
} from "@/db/queries/context-groups-to-embedded-files-queries"
import { getEmbeddedFilesAndFolders } from "@/db/queries/embedded-files-queries"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import { SelectContextGroupToEmbeddedFile } from "@/db/schema/context-groups-to-embedded-files-schema"
import { SelectEmbeddedFile } from "@/db/schema/embedded-files-schema"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DeleteDialog } from "../dashboard/reusable/delete-dialog"
import { ContextMultiSelect } from "./context-multi-select"

interface EditContextGroupProps {
  contextGroup: SelectContextGroup
  embeddedFiles: (SelectContextGroupToEmbeddedFile & {
    embeddedFile: SelectEmbeddedFile
  })[]
  allEmbeddedFilesInProject: Awaited<
    ReturnType<typeof getEmbeddedFilesAndFolders>
  >
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

      const selectedFiles = allEmbeddedFilesInProject.filter(
        file => file.type === "file" && selectedFileIds.includes(file.id)
      )
      const newSelectedFileIds = selectedFiles.map(file => file.id)

      const filesToAdd = newSelectedFileIds.filter(
        id => !currentFileIds.includes(id)
      )
      const filesToRemove = currentFileIds.filter(
        id => !newSelectedFileIds.includes(id)
      )

      if (filesToAdd.length > 0) {
        await addEmbeddedFilesToContextGroup(contextGroup.id, filesToAdd)
      }

      if (filesToRemove.length > 0) {
        await removeEmbeddedFilesFromContextGroup(
          contextGroup.id,
          filesToRemove
        )
      }

      router.refresh()
      router.back()
    } catch (error) {
      console.error("Error updating context group:", error)
      alert("An error occurred while updating the context group")
    }
  }

  const handleDeleteContextGroup = async () => {
    try {
      await deleteContextGroup(contextGroup.id)
      router.refresh()
      router.push("..")
    } catch (error) {
      console.error("Error deleting context group:", error)
      alert("An error occurred while deleting the context group")
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
        data={allEmbeddedFilesInProject.map(item => ({
          id: item.id,
          name: item.path,
          type: item.type,
          path: item.path
        }))}
        selectedIds={selectedFileIds}
        onToggleSelect={setSelectedFileIds}
      />

      <div className="flex items-center justify-between">
        <DeleteDialog
          title="Delete Context Group"
          description="Are you sure you want to delete this context group? This action cannot be undone."
          onDelete={handleDeleteContextGroup}
        />

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleUpdateContextGroup}>Save</Button>
        </div>
      </div>
    </div>
  )
}
