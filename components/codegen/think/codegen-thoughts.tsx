import { parseCodegenThinkResponse } from "@/lib/ai/codegen-system/think/parse-codegen-think-response"
import { AIThought } from "@/types/ai"
import { FC, useEffect, useState } from "react"

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
    <div className="codegen-thoughts">
      {thoughts.map((thought, index) => (
        <div key={thought.number} className="thought-item">
          <div className="thought-number">{thought.number}</div>
          <textarea
            value={thought.text}
            onChange={e => handleThoughtChange(index, e.target.value)}
            className="thought-text"
          />
        </div>
      ))}
    </div>
  )
}
