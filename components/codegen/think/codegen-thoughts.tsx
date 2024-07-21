import { parseCodegenThinkResponse } from "@/lib/ai/codegen-system/think/parse-codegen-think-response"
import { AIThought } from "@/types/ai"
import { FC, useEffect, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"

interface CodegenThoughtsProps {
  response: string
  onUpdate: (updatedThoughts: AIThought[]) => void
}

export const CodegenThoughts: FC<CodegenThoughtsProps> = ({
  response,
  onUpdate
}) => {
  const [thoughts, setThoughts] = useState<AIThought[]>([])

  useEffect(() => {
    const parsedResponse = parseCodegenThinkResponse(response)
    setThoughts(parsedResponse.thoughts)
  }, [response])

  const handleThoughtChange = (index: number, newText: string) => {
    const updatedThoughts = thoughts.map((thought, i) =>
      i === index ? { ...thought, text: newText } : thought
    )
    setThoughts(updatedThoughts)
    onUpdate(updatedThoughts)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">Think</div>
        <div>Edit the AI's thoughts if needed.</div>
      </div>

      {thoughts.map((thought, index) => (
        <div key={thought.number} className="relative">
          <div className="bg-primary text-primary-foreground absolute -left-8 top-2 flex size-6 items-center justify-center rounded-full text-sm font-semibold">
            {thought.number}
          </div>
          <ReactTextareaAutosize
            className="thought-text border-border bg-card focus:ring-primary w-full resize-none rounded-lg border p-4 pl-6 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2"
            value={thought.text}
            onChange={e => handleThoughtChange(index, e.target.value)}
            minRows={2}
            maxRows={10}
          />
        </div>
      ))}
    </div>
  )
}
