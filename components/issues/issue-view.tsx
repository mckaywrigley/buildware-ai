"use client"

import { generateCodegenAIMessage } from "@/actions/ai/generate-codegen-ai-message"
import { savePrompt } from "@/actions/evals/save-codegen-prompt"
import { deleteGitHubPR } from "@/actions/github/delete-pr"
import { embedTargetBranch } from "@/actions/github/embed-target-branch"
import { generatePR } from "@/actions/github/generate-pr"
import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { MessageMarkdown } from "@/components/instructions/message-markdown"
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
  deleteIssue,
  deleteIssueMessagesByIssueId,
  getIssueMessagesByIssueId,
  updateIssue,
  updateIssueMessage
} from "@/db/queries"
import {
  SelectInstruction,
  SelectIssue,
  SelectIssueMessage,
  SelectProject
} from "@/db/schema"
import { buildCodegenActPrompt } from "@/lib/ai/codegen-system/act/build-codegen-act-prompt"
import { parseCodegenActResponse } from "@/lib/ai/codegen-system/act/parse-codegen-act-response"
import { buildCodegenPlanPrompt } from "@/lib/ai/codegen-system/plan/build-codegen-plan-prompt"
import { buildCodegenThinkPrompt } from "@/lib/ai/codegen-system/think/build-codegen-think-prompt"
import { Loader2, Pencil, Play, RefreshCw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import { CRUDPage } from "../dashboard/reusable/crud-page"
import { IssueContext } from "./issue-context"

interface IssueViewProps {
  item: SelectIssue
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
  workspaceId: string
}

let globalSequence = 1

export const IssueView: React.FC<IssueViewProps> = ({
  item,
  project,
  attachedInstructions,
  workspaceId
}) => {
  const router = useRouter()

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [selectedInstruction, setSelectedInstruction] = React.useState<{
    id: string
    content: string
    name: string
  } | null>(null)
  const [isRunning, setIsRunning] = React.useState(false)
  const [messages, setMessages] = useState<SelectIssueMessage[]>([])

  const sequenceRef = useRef(globalSequence)

  useEffect(() => {
    fetchMessages()
  }, [item.id])

  const addMessage = async (content: string) => {
    const newMessage = await createIssueMessageRecord({
      issueId: item.id,
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
    if (!project.githubRepoFullName || !project.githubTargetBranch) {
      alert("Please connect your project to a GitHub repository first.")
      return
    }

    setIsRunning(true)
    try {
      await deleteIssueMessagesByIssueId(issue.id)
      setMessages([])

      sequenceRef.current = 1
      globalSequence = 1

      await updateIssue(issue.id, { status: "in_progress" })

      await addMessage("Updating branch embeddings...")

      // Embed the target branch to make sure embeddings are up to date
      await embedTargetBranch({
        projectId: project.id,
        githubRepoFullName: project.githubRepoFullName,
        branchName: project.githubTargetBranch,
        installationId: project.githubInstallationId
      })

      const embeddingsQueryText = `${issue.name}\n${issue.content}`

      await addMessage("Searching codebase...")

      const codebaseFiles = await getMostSimilarEmbeddedFiles(
        embeddingsQueryText,
        project.id
      )

      const instructionsContext = attachedInstructions
        .map(
          ({ instruction }) =>
            `<instruction name="${instruction.name}">\n${instruction.content}\n</instruction>`
        )
        .join("\n\n")

      const thinkMessage = await addMessage("Thinking...")

      const { systemPrompt: thinkSystemPrompt, userMessage: thinkUserMessage } =
        await buildCodegenThinkPrompt({
          issue: {
            name: issue.name,
            description: issue.content
          },
          codebaseFiles: codebaseFiles.map(file => ({
            path: file.path,
            content: file.content ?? ""
          })),
          instructionsContext
        })

      const thinkResponse = await generateCodegenAIMessage(
        [{ role: "user", content: thinkUserMessage }],
        thinkSystemPrompt
      )

      await updateMessage(thinkMessage.id, thinkResponse)
      await savePrompt(thinkResponse, issue.name, "think", "response")

      return

      const planMessage = await addMessage("Generating plan...")

      const { systemPrompt: planSystemPrompt, userMessage: planUserMessage } =
        await buildCodegenPlanPrompt({
          issue: {
            name: issue.name,
            description: issue.content
          },
          codebaseFiles: codebaseFiles.map(file => ({
            path: file.path,
            content: file.content ?? ""
          })),
          instructionsContext,
          thinkPrompt: thinkResponse
        })

      const planResponse = await generateCodegenAIMessage(
        [{ role: "user", content: planUserMessage }],
        planSystemPrompt
      )

      await updateMessage(planMessage.id, planResponse)

      const codeMessage = await addMessage("Generating PR...")

      const { systemPrompt: actSystemPrompt, userMessage: actUserMessage } =
        await buildCodegenActPrompt({
          issue: { name: issue.name, description: issue.content },
          codebaseFiles: codebaseFiles.map(file => ({
            path: file.path,
            content: file.content ?? ""
          })),
          instructionsContext,
          planPrompt: planResponse
        })

      const actResponse = await generateCodegenAIMessage(
        [{ role: "user", content: actUserMessage }],
        actSystemPrompt
      )

      const parsedActResponse = parseCodegenActResponse(actResponse)

      const { prLink, branchName } = await generatePR(
        issue.name.replace(/\s+/g, "-"),
        project,
        parsedActResponse
      )

      await updateIssue(issue.id, {
        status: "done",
        prLink: prLink || undefined,
        prBranch: branchName
      })

      if (prLink) {
        await updateMessage(codeMessage.id, `GitHub PR: ${prLink}`)
      } else {
        await updateMessage(codeMessage.id, "Failed to create PR")
      }

      await addMessage("Done!")
    } catch (error) {
      console.error("Failed to run issue:", error)
      await addMessage(`Error: Failed to run issue: ${error}`)
      await updateIssue(issue.id, { status: "failed" })
    } finally {
      setIsRunning(false)
    }
  }

  const handleRerun = async (issue: SelectIssue) => {
    if (issue.prLink && issue.prBranch) {
      await deleteGitHubPR(project, issue.prLink, issue.prBranch)
    }
    await updateIssue(issue.id, {
      prLink: null,
      prBranch: null,
      status: "ready"
    })
    await handleRun(issue)
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
          onClick={() =>
            item.status === "completed" ? handleRerun(item) : handleRun(item)
          }
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

        <IssueContext
          name={item.name}
          content={item.content}
          selectedInstructions={attachedInstructions.map(ai => ai.instruction)}
        />
      </div>

      {attachedInstructions.length > 0 && (
        <div className="my-6">
          <div className="mb-2 text-lg font-semibold">
            Attached instructions
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedInstructions.map(instruction => (
              <Button
                key={instruction.instructionId}
                variant="outline"
                size="sm"
                onClick={() => setSelectedInstruction(instruction.instruction)}
              >
                {instruction.instruction.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Card className="mt-6">
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
        open={!!selectedInstruction}
        onOpenChange={() => setSelectedInstruction(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedInstruction?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Card>
              <CardContent className="bg-secondary/50 p-4">
                <MessageMarkdown content={selectedInstruction?.content || ""} />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </CRUDPage>
  )
}
