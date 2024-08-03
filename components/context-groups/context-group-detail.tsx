"use client"

import { getContextGroup } from "@/actions/context-groups/get-context-group"
import { addFileToContextGroup } from "@/actions/context-group-files/add-file-to-context-group"
import { removeFileFromContextGroup } from "@/actions/context-group-files/remove-file-from-context-group"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import { SelectContextGroupFile } from "@/db/schema/context-group-files-schema"
import { useEffect, useState } from "react"

export function ContextGroupDetail({ contextGroupId }: { contextGroupId: string }) {
  const [contextGroup, setContextGroup] = useState<SelectContextGroup | null>(null)
  const [files, setFiles] = useState<SelectContextGroupFile[]>([])
  const [newFilePath, setNewFilePath] = useState("")

  useEffect(() => {
    const fetchContextGroup = async () => {
      try {
        const group = await getContextGroup(contextGroupId)
        setContextGroup(group)
        setFiles(group.files || [])
      } catch (error) {
        console.error("Error fetching context group:", error)
      }
    }

    fetchContextGroup()
  }, [contextGroupId])

  const handleAddFile = async () => {
    try {
      const addedFile = await addFileToContextGroup({
        contextGroupId,
        filePath: newFilePath
      })
      setFiles([...files, addedFile])
      setNewFilePath("")
    } catch (error) {
      console.error("Error adding file:", error)
    }
  }

  const handleRemoveFile = async (filePath: string) => {
    try {
      await removeFileFromContextGroup(contextGroupId, filePath)
      setFiles(files.filter(file => file.filePath !== filePath))
    } catch (error) {
      console.error("Error removing file:", error)
    }
  }

  if (!contextGroup) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{contextGroup.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{contextGroup.description}</p>
        <h3 className="text-lg font-semibold mb-2">Files</h3>
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="flex justify-between items-center">
              <span>{file.filePath}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveFile(file.filePath)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex space-x-2">
          <Input
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            placeholder="Enter file path"
          />
          <Button onClick={handleAddFile}>Add File</Button>
        </div>
      </CardContent>
    </Card>
  )
}