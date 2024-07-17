"use client"

import { generateAIResponse } from "@/actions/ai/generate-ai-response"
import { deleteGitHubPR } from "@/actions/github/delete-pr"
import { embedTargetBranch } from "@/actions/github/embed-target-branch"
import { generatePR } from "@/actions/github/generate-pr"
import { getMostSimilarEmbeddedFiles } from "@/actions/retrieval/get-similar-files"
import { runLocalIssue } from "@/actions/local/run-local-issue"
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
import { SelectIssue, SelectIssueMessage, SelectProject } from "@/db/schema"
import { buildCodeGenPrompt } from "@/lib/ai/build-codegen-prompt"
import { buildCodePlanPrompt } from "@/lib/ai/build-plan-prompt"
import { parseAIResponse } from "@/lib/ai/parse-ai-response"
import { Loader2, Pencil, Play, RefreshCw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import { CRUDPage } from "../dashboard/reusable/crud-page"

interface IssueViewProps {
  item: SelectIssue
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: {
      id: string
      content: string
      name: string
    }
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
  const [isLocalRun, setIsLocalRun] = React.useState(false)
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

  const handleRun = async (issue: SelectIssue, isLocal: boolean) => {
    setIsRunning(true)
    setIsLocalRun(isLocal)
    try {
      await deleteIssueMessagesByIssueId(issue.id)
      setMessages([])
      sequenceRef.current = 1
      globalSequence = 1

      await addMessage(isLocal ? "Running locally..." : "Embedding target branch...")

      if (!isLocal) {
        if (!project.githubRepoFullName || !project.githubTargetBranch) {
          throw new Error("GitHub repository information is missing")
        }
        await embedTargetBranch({
          projectId: project.id,
          githubRepoFullName: project.githubRepoFullName,
          branchName: project.githubTargetBranch,
          installationId: project.githubInstallationId
        })
      }

      await updateIssue(issue.id, { status: "in_progress" })
      const planMessage = await addMessage("Generating plan...")

      const embeddingsQueryText = `${issue.name} ${issue.content}`

      const codebaseFiles = isLocal
        ? await runLocalIssue.getLocalFiles(project.localPath!)
        : await getMostSimilarEmbeddedFiles(embeddingsQueryText, project.id)

      const instructionsContext = attachedInstructions
        .map(
          ({ instruction }) =>
            `<instruction name="${instruction.name}">\n${instruction.content}\n</instruction>`
        )
        .join("\n\n")

      const codeplanPrompt = await buildCodePlanPrompt({
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

      const aiCodePlanResponse = await generateAIResponse([
        { role: "user", content: codeplanPrompt }
      ])

      await updateMessage(planMessage.id, aiCodePlanResponse)
      const prMessage = await addMessage(isLocal ? "Applying changes locally..." : "Generating PR...")

      const codegenPrompt = await buildCodeGenPrompt({
        issue: { title: issue.name, description: issue.content },
        codebaseFiles: codebaseFiles.map(file => ({
          path: file.path,
          content: file.content ?? ""
        })),
        plan: aiCodePlanResponse,
        instructionsContext
      })

      const aiCodeGenResponse = await generateAIResponse([
        { role: "user", content: codegenPrompt }
      ])

      const parsedAIResponse = parseAIResponse(aiCodeGenResponse)

      if (isLocal) {
        await runLocalIssue.applyLocalChanges(project.localPath!, parsedAIResponse)
        await updateIssue(issue.id, { status: "completed" })
        await updateMessage(prMessage.id, "Changes applied locally")
      } else {
        const { prLink, branchName } = await generatePR(
          issue.name.replace(/\s+/g, "-"),
          project,
          parsedAIResponse
        )

        await updateIssue(issue.id, {
          status: "completed",
          prLink: prLink || undefined,
          prBranch: branchName
        })

        if (prLink) {
          await updateMessage(prMessage.id, `GitHub PR: ${prLink}`)
        } else {
          await updateMessage(prMessage.id, "Failed to create PR")
        }
      }
    } catch (error) {
      console.error("Failed to run issue:", error)
      await addMessage(`Error: Failed to run issue: ${error}`)
      await updateIssue(issue.id, { status: "failed" })
    } finally {
      setIsRunning(false)
      setIsLocalRun(false)
    }
  }

  const handleRerun = async (issue: SelectIssue, isLocal: boolean) => {
    if (!isLocal && issue.prLink && issue.prBranch) {
      await deleteGitHubPR(project, issue.prLink, issue.prBranch)
    }
    await updateIssue(issue.id, {
      prLink: null,
      prBranch: null,
      status: "ready"
    })
    await handleRun(issue, isLocal)
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
          onClick={() => handleRun(item, false)}
          disabled={isRunning}
        >
          {isRunning && !isLocalRun ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Running...
            </>
          ) : item.status === "completed" ? (
            <>
              <RefreshCw className="mr-2 size-4" />
              Run Again (GitHub)
            </>
          ) : (
            <>
              <Play className="mr-2 size-4" />
              Run (GitHub)
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleRun(item, true)}
          disabled={isRunning || !project.localPath}
        >
          {isRunning && isLocalRun ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Running Locally...
            </>
          ) : item.status === "completed" ? (
            <>
              <RefreshCw className="mr-2 size-4" />
              Run Again (Local)
            </>
          ) : (
            <>
              <Play className="mr-2 size-4" />
              Run (Local)
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

      {attachedInstructions.length > 0 && (
        <div className="my-6">
          <div className="mb-2 text-lg font-semibold">Attached instruction</div>
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