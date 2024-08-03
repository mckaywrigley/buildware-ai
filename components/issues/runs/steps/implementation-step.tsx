"use client"

import { Button } from "@/components/ui/button"
import { ParsedImplementation } from "@/types/run"
import { useEffect, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"

interface ImplementationStepProps {
  parsedImplementation: ParsedImplementation
  onUpdateParsedImplementation: (
    updatedParsedImplementation: ParsedImplementation
  ) => void
}

export const ImplementationStep = ({
  parsedImplementation,
  onUpdateParsedImplementation
}: ImplementationStepProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [localFiles, setLocalFiles] = useState(parsedImplementation.files)

  useEffect(() => {
    setLocalFiles(parsedImplementation.files)
  }, [parsedImplementation.files])

  const handleEditFile = (index: number) => {
    setEditingIndex(index)
  }

  const handleSaveFile = () => {
    setEditingIndex(null)
    onUpdateParsedImplementation({ ...parsedImplementation, files: localFiles })
  }

  const handleContentChange = (index: number, newContent: string) => {
    const updatedFiles = localFiles.map((file, i) =>
      i === index ? { ...file, content: newContent } : file
    )
    setLocalFiles(updatedFiles)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">Implementation</div>
        <div>Edit the AI's implementation if needed.</div>
      </div>

      {localFiles.map((file, index) => (
        <div key={index} className="rounded-lg border p-4">
          <div className="mb-2 font-medium">{file.path}</div>
          {editingIndex === index ? (
            <>
              <ReactTextareaAutosize
                className="mb-2 w-full rounded border p-2"
                value={file.content}
                onChange={e => handleContentChange(index, e.target.value)}
                minRows={3}
              />
              <Button onClick={handleSaveFile}>Save</Button>
            </>
          ) : (
            <>
              <pre className="bg-background overflow-x-auto rounded p-2">
                <code>{file.content}</code>
              </pre>
              <Button onClick={() => handleEditFile(index)} className="mt-2">
                Edit
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
