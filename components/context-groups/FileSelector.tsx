"use client"

import { addFileToContextGroup } from "@/actions/context-groups"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectContextGroupFile } from "@/db/schema/context-groups-schema"
import { useState } from "react"

interface FileSelectorProps {
  contextGroupId: string
  onFileAdded: (file: SelectContextGroupFile) => void
}

export function FileSelector({ contextGroupId, onFileAdded }: FileSelectorProps) {
  const [filePath, setFilePath] = useState("")

  const handleAddFile = async () => {
    if (!filePath) return

    try {
      const newFile = await addFileToContextGroup({
        contextGroupId,
        filePath
      })
      onFileAdded(newFile)
      setFilePath("")
    } catch (error) {
      console.error("Error adding file to context group:", error)
    }
  }

  return (
    <div className="mt-4 flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Enter file path"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
      />
      <Button onClick={handleAddFile}>Add File</Button>
    </div>
  )
}