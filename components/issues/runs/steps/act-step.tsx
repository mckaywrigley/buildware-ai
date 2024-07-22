"use client"

import { AIFileInfo } from "@/types/ai"
import { FC } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { StepLoader } from "./step-loader"

interface ActStepProps {
  files: AIFileInfo[]
  onUpdateFiles: (updatedFiles: AIFileInfo[]) => void
}

export const ActStep: FC<ActStepProps> = ({ files, onUpdateFiles }) => {
  const handleFileChange = (index: number, newText: string) => {
    const updatedFiles = files.map((file, i) =>
      i === index ? { ...file, text: newText } : file
    )
    onUpdateFiles(updatedFiles)
  }

  if (files.length === 0) {
    return <StepLoader text="Acting..." />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">Act</div>
        <div>Edit the AI's actions if needed.</div>
      </div>

      {files.map((file, index) => (
        <div key={index} className="relative">
          <div className="bg-primary text-primary-foreground absolute -left-8 top-2 flex size-6 items-center justify-center rounded-full text-sm font-semibold">
            {file.path}
          </div>
          <ReactTextareaAutosize
            className="action-text border-border bg-card focus:ring-primary w-full resize-none rounded-lg border p-4 pl-6 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2"
            value={file.content}
            onChange={e => handleFileChange(index, e.target.value)}
            minRows={2}
            maxRows={10}
          />
        </div>
      ))}
    </div>
  )
}
