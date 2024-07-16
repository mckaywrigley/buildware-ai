"use client"

import { MessageMarkdown } from "@/components/prompts/message-markdown"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  createIssueMessageRecord,
  deleteIssueMessagesByIssueId,
  getIssueMessagesByIssueId,
  updateIssueMessage
} from "@/db/queries/issue-messages-queries"
import { deleteIssue, updateIssue } from "@/db/queries/issue-queries"
import { SelectIssue, SelectIssueMessage, SelectProject } from "@/db/schema"
import { generatePR } from "@/lib/actions/github/generate-pr"
import { generateAIResponse } from "@/lib/actions/llm"
import { getMostSimilarEmbeddedFiles } from "@/lib/actions/retrieval/codebase"
import {
  buildLabelAssignmentCodeGenPrompt,
  buildLabelAssignmentCodePlanPrompt
} from "@/lib/linear-webhook/labels"
import { parseAIResponse } from "@/lib/utils/parse-ai-response"
import { Loader2, Pencil, Play, RefreshCw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import { CRUDPage } from "../dashboard/reusable/crud-page"

interface IssueViewProps {
  item: SelectIssue
  project: SelectProject
  attachedPrompts: {
    promptId: string
    issueId: string
    prompt: {
      id: string
      content: string
      title: string
    }
  }[]
  workspaceId: string
}

let globalSequence = 1

export const IssueView: React.FC<IssueViewProps> = ({
  item,
  project,
  attachedPrompts,
  workspaceId
}) => {
  const router = useRouter()

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [selectedPrompt, setSelectedPrompt] = React.useState<{
    id: string
    content: string
    title: string
  } | null>(null)
  const [isRunning, setIsRunning] = React.useState(false)
  const [messages, setMessages] = useState<SelectIssueMessage[]>([])

  const sequenceRef = useRef(globalSequence)

  useEffect(() => {
    fetchMessages()
  }, [item.id])

  const addMessage = async (role: string, content: string) => {
    const newMessage = await createIssueMessageRecord({
      issueId: item.id,
      role,
      content,
      sequence: sequenceRef.current++
    })
    setMessages(prev => [...prev, newMessage])
    globalSequence = sequenceRef.current
    return newMessage
  }

  const updateMessage = async (id: string, content: string) => {
    await updateIssueMessage(id, { content })
    setMessages(prev =>
      prev.map(message =>
        message.id === id ? { ...message, content } : message
      )
    )
  }

  const fetchMessages = async () => {
    const fetchedMessages = await getIssueMessagesByIssueId(item.id)
    setMessages(fetchedMessages.sort((a, b) => a.sequence - b.sequence))
    sequenceRef.current =
      Math.max(...fetchedMessages.map(m => m.sequence), 0) + 1
    globalSequence = sequenceRef.current
  }

  const handleDelete = async () => {
    try {
      await deleteIssue(item.id)
      setIsDeleteOpen(false)
      router.push(`../issues`)
    } catch (error) {
      console.error("Failed to delete issue:", error)
    }
  }

  const handleRun = async (issue: SelectIssue) => {
    setIsRunning(true)
    try {
      await deleteIssueMessagesByIssueId(issue.id)
      setMessages([])
      sequenceRef.current = 1
      globalSequence = 1

      await updateIssue(item.id, { status: "in_progress" })
      const planMessage = await addMessage("system", "Generating plan...")

      const embeddingsQueryText = `${issue.name} ${issue.content}`

      const codebaseFiles = await getMostSimilarEmbeddedFiles(
        embeddingsQueryText,
        project.id
      )

      const instructionsContext = attachedPrompts
        .map(
          ({ prompt }) =>
            `<instruction name="${prompt.title}">\n${prompt.content}\n</instruction>`
        )
        .join("\n\n")

      const labelAssignmentCodePlanPrompt =
        await buildLabelAssignmentCodePlanPrompt({
          issue: {
            title: issue.name,
            description: issue.content
          },
          codebaseFiles: codebaseFiles.map(file => ({
            path: file.path,
            content: file.content ?? ""
          })),
          instructionsContext
        })

      const aiCodePlanResponse = await generateAIResponse([
        { role: "user", content: labelAssignmentCodePlanPrompt }
      ])

      await updateMessage(planMessage.id, aiCodePlanResponse)
      const prMessage = await addMessage("system", "Generating PR...")

      const labelAssignmenCodeGenPrompt =
        await buildLabelAssignmentCodeGenPrompt({
          issue: { title: issue.name, description: issue.content },
          codebaseFiles: codebaseFiles.map(file => ({
            path: file.path,
            content: file.content ?? ""
          })),
          plan: aiCodePlanResponse,
          instructionsContext
        })

      const aiCodeGenResponse = await generateAIResponse([
        { role: "user", content: labelAssignmenCodeGenPrompt }
      ])

      const parsedAIResponse = parseAIResponse(aiCodeGenResponse)

      const prLink = await generatePR(
        issue.name.replace(/\s+/g, "-"),
        project,
        parsedAIResponse
      )

      await updateMessage(prMessage.id, `GitHub PR: ${prLink}`)

      await updateIssue(item.id, { status: "completed" })
    } catch (error) {
      console.error("Failed to run issue:", error)
      await addMessage("system", `Error: Failed to run issue: ${error}`)
      await updateIssue(item.id, { status: "failed" })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <CRUDPage
      pageTitle={item.name}
      backText="Back to Issues"
      backLink={`../issues`}
    >
      <div className="mb-4 flex justify-start gap-2">
        <Button
          variant="create"
          size="sm"
          onClick={() => handleRun(item)}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Running...
            </>
          ) : item.status === "completed" ? (
            <>
              <RefreshCw className="mr-2 size-4" />
              Run Again
            </>
          ) : (
            <>
              <Play className="mr-2 size-4" />
              Run
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(
              `/${workspaceId}/${item.projectId}/issues/${item.id}/edit`
            )
          }
        >
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Issue</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this issue? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {attachedPrompts.length > 0 && (
        <div className="my-6">
          <div className="mb-2 text-lg font-semibold">Attached Prompts</div>
          <div className="flex flex-wrap gap-2">
            {attachedPrompts.map(prompt => (
              <Button
                key={prompt.promptId}
                variant="outline"
                size="sm"
                onClick={() => setSelectedPrompt(prompt.prompt)}
              >
                {prompt.prompt.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="bg-secondary/50 p-4">
          <MessageMarkdown content={item.content} />
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <div className="space-y-8">
        <div className="text-lg font-semibold">Messages</div>
        {messages.map(message => (
          <React.Fragment key={message.id}>
            <Card>
              <CardContent className="bg-secondary p-4">
                <MessageMarkdown content={message.content} />
              </CardContent>
            </Card>
          </React.Fragment>
        ))}
      </div>

      <Dialog
        open={!!selectedPrompt}
        onOpenChange={() => setSelectedPrompt(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedPrompt?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Card>
              <CardContent className="bg-secondary/50 p-4">
                <MessageMarkdown content={selectedPrompt?.content || ""} />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </CRUDPage>
  )
}
