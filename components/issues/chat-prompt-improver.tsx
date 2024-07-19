"use client"

import { improveIssuePrompt } from "@/actions/ai/improve-issue-prompt"
import Anthropic from "@anthropic-ai/sdk"
import endent from "endent"
import { Loader2, Send, Sparkles } from "lucide-react"
import { FC, useEffect, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { MessageMarkdown } from "../instructions/message-markdown"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"

interface ChatPromptImproverProps {
  startingIssue: {
    name: string
    content: string
  }
}

export const ChatPromptImprover: FC<ChatPromptImproverProps> = ({
  startingIssue
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [improvedIssue, setImprovedIssue] = useState(startingIssue)
  const [userInput, setUserInput] = useState("")
  const [messages, setMessages] = useState<Anthropic.Messages.MessageParam[]>(
    []
  )

  useEffect(() => {
    setImprovedIssue(startingIssue)
  }, [startingIssue])

  useEffect(() => {
    if (isDialogOpen && messages.length === 0) {
      handleSubmit("Please improve my issue.")
    }
  }, [isDialogOpen, messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value)
  }

  const handleSubmit = async (message: string) => {
    setUserInput("")
    setIsGenerating(true)

    const updatedMessages: Anthropic.Messages.MessageParam[] = [
      ...messages,
      { role: "user", content: message }
    ]
    setMessages(updatedMessages)

    const messageResponse = await improveIssuePrompt(
      startingIssue,
      updatedMessages
    )
    console.log("messageResponse", messageResponse)
    setImprovedIssue(messageResponse.improvedIssue)

    const formattedResponse = messageResponse.isDone
      ? "Completed!"
      : endent`
    ${messageResponse.message.explanation}

    ${messageResponse.message.nextQuestion}
    `
    setMessages([
      ...updatedMessages,
      { role: "assistant", content: formattedResponse }
    ])

    setIsGenerating(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <Button
          variant="outline"
          disabled={isDialogOpen}
          onClick={() => setIsDialogOpen(true)}
        >
          <Sparkles className="mr-2 size-4" />
          AI Improve
        </Button>
      </DialogTrigger>

      <DialogContent
        className="flex max-h-[80vh] max-w-3xl flex-col gap-8 overflow-y-auto"
        hideCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>AI Issue Improver</DialogTitle>
          <DialogDescription>
            Chat with AI to improve your issue
          </DialogDescription>
        </DialogHeader>

        <div>
          {improvedIssue && (
            <div className="h-[300px] overflow-y-auto rounded border p-2">
              {isGenerating ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Improving issue...
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold">{improvedIssue.name}</div>
                  <MessageMarkdown
                    className="text-sm"
                    content={improvedIssue.content}
                  />
                </>
              )}
            </div>
          )}
        </div>

        <div className="mb-4 space-y-2">
          {messages.map((message, index) => {
            return (
              <div key={index} className="">
                <strong>{message.role === "user" ? "User: " : "AI: "}</strong>

                {message.role === "assistant" ? (
                  <MessageMarkdown
                    className="text-sm"
                    content={
                      typeof message.content === "string"
                        ? message.content
                        : JSON.stringify(message.content)
                    }
                  />
                ) : (
                  <div className="text-sm">
                    {typeof message.content === "string"
                      ? message.content
                      : JSON.stringify(message.content)}
                  </div>
                )}

                <hr className="my-2" />
              </div>
            )
          })}
        </div>

        <div className="flex gap-2">
          <ReactTextareaAutosize
            className="w-full resize-none rounded border bg-transparent px-3 py-2 focus-visible:outline-none"
            placeholder="Type your message..."
            minRows={2}
            maxRows={5}
            value={userInput}
            onChange={handleInputChange}
          />

          <Button
            className="rounded bg-blue-500 px-4 py-2 text-white"
            onClick={() => handleSubmit(userInput)}
            disabled={isGenerating}
          >
            <Send className="size-4" />
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={() => setIsGenerating(true)}
            className="w-full max-w-[200px]"
            disabled={isGenerating}
          >
            {isGenerating ? "Improving..." : "Create Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
