"use client"

import { improveIssuePrompt } from "@/actions/ai/improve-issue-prompt"
import { cn } from "@/lib/utils"
import Anthropic from "@anthropic-ai/sdk"
import endent from "endent"
import { Loader2, Send, Sparkles } from "lucide-react"
import { FC, HTMLAttributes, useEffect, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { MessageMarkdown } from "../instructions/message-markdown"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"

interface ChatPromptImproverProps extends HTMLAttributes<HTMLDivElement> {
  startingIssue: {
    name: string
    content: string
  }
  onUpdateIssue: (issue: { name: string; content: string }) => void
}

export const ChatPromptImprover: FC<ChatPromptImproverProps> = ({
  startingIssue,
  onUpdateIssue,
  ...props
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(true)
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

    try {
      const messageResponse = await improveIssuePrompt(
        startingIssue,
        updatedMessages
      )
      setImprovedIssue(messageResponse.improvedIssue)

      const formattedResponse = messageResponse.isDone
        ? "Completed!"
        : endent`
    ${messageResponse.message.explanation}

    ${messageResponse.message.nextQuestion}
    `
      setMessages(prevMessages => [
        ...prevMessages,
        { role: "assistant", content: formattedResponse }
      ])
    } catch (error) {
      console.error("Error improving issue:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setMessages([])
    setImprovedIssue(startingIssue)
  }

  const handleUpdateIssue = () => {
    handleClose()
    onUpdateIssue(improvedIssue)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger className={cn(props.className)}>
        <Button
          variant="outline"
          disabled={isDialogOpen}
          onClick={() => setIsDialogOpen(true)}
          className="mt-4"
        >
          <Sparkles className="mr-2 size-4" />
          Improve Issue
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-secondary flex size-full max-h-[90vh] max-w-[calc(100vw-24px)] flex-col gap-0 xl:max-w-[1200px]"
        hideCloseButton
      >
        <DialogHeader className="border-primary/50 border-b pb-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <DialogTitle>Issue Improver</DialogTitle>
              <DialogDescription>
                Chat with the AI to improve your issue.
              </DialogDescription>
            </div>

            <div className="flex gap-2">
              <Button
                className="mb-2 w-full max-w-[200px]"
                variant="outline"
                onClick={handleClose}
                disabled={isGenerating}
              >
                Close
              </Button>

              <Button
                className="w-full max-w-[200px]"
                variant="create"
                onClick={handleUpdateIssue}
                disabled={isGenerating}
              >
                {isGenerating ? "Improving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid max-h-full flex-1 grid-cols-2 gap-2 overflow-hidden">
          <div className="border-primary/50 overflow-y-auto rounded border-r p-4">
            {isGenerating ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Improving issue...
              </div>
            ) : (
              <div className="flex h-full flex-col gap-2 overflow-y-auto">
                <div className="text-lg font-bold">{improvedIssue.name}</div>
                <MessageMarkdown className="" content={improvedIssue.content} />
              </div>
            )}
          </div>

          <div className="flex h-full flex-col overflow-hidden p-4">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-secondary rounded-lg p-2 text-right"
                          : "bg-muted rounded-lg p-2 text-left"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <MessageMarkdown
                          className="bg-background rounded-xl p-2"
                          content={
                            typeof message.content === "string"
                              ? message.content
                              : JSON.stringify(message.content)
                          }
                        />
                      ) : (
                        <div>
                          {typeof message.content === "string"
                            ? message.content
                            : JSON.stringify(message.content)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <ReactTextareaAutosize
                className="w-full resize-none rounded px-3 py-2 text-sm focus-visible:outline-none"
                placeholder="Type your message..."
                minRows={2}
                maxRows={8}
                value={userInput}
                onChange={handleInputChange}
              />

              <Button
                className="h-auto w-[50px] rounded"
                onClick={() => handleSubmit(userInput)}
                disabled={isGenerating || !userInput}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
