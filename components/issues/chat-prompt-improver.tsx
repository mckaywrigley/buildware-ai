"use client"

import { useChat } from "ai/react"
import { useEffect } from "react"

interface ChatPromptImproverProps {
  onMessagesUpdate: (messages: string[]) => void
}

export default function ChatPromptImprover({
  onMessagesUpdate
}: ChatPromptImproverProps) {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  useEffect(() => {
    onMessagesUpdate(messages.map(message => message.content))
  }, [messages, onMessagesUpdate])

  return (
    <div className="p-4">
      <div className="mb-4 space-y-2">
        {messages.map(message => (
          <div
            key={message.id}
            className={`rounded p-2 ${
              message.role === "user"
                ? "bg-gray-700 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            <strong>{message.role === "user" ? "User: " : "AI: "}</strong>
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          className="grow rounded border p-2"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Submit
        </button>
      </form>
    </div>
  )
}
