"use client"

import { CodegenThoughts } from "@/components/codegen/think/codegen-thoughts"
import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createIssueMessageRecord, updateIssue } from "@/db/queries"
import { SelectIssue, SelectIssueMessage, SelectProject } from "@/db/schema"
import { MOCK_THINK_DATA } from "@/lib/constants/codegen-mock-data/think/mock-think-data"
import { Loader2, Play, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, useRef, useState } from "react"

interface RunIssueProps {
  workspaceId: string
  projectId: string
  issueId: string
  initialIssue: SelectIssue
  initialProject: SelectProject
  initialMessages: SelectIssueMessage[]
}

export const RunIssue: FC<RunIssueProps> = ({
  workspaceId,
  projectId,
  issueId,
  initialIssue,
  initialProject,
  initialMessages
}) => {
  const router = useRouter()

  const [issue, setIssue] = useState<SelectIssue>(initialIssue)
  const [project] = useState<SelectProject>(initialProject)
  const [isRunning, setIsRunning] = useState(false)
  const [messages, setMessages] =
    useState<SelectIssueMessage[]>(initialMessages)
  const [currentStep, setCurrentStep] = useState<
    "clarify" | "think" | "plan" | "act" | "verify" | null
  >("think")

  const sequenceRef = useRef(initialMessages.length + 1)

  const fetchMessages = async () => {
    const newMessage = await createIssueMessageRecord({
      issueId: issue.id,
      content: "New message content",
      sequence: sequenceRef.current++
    })
    setMessages(prevMessages => [...prevMessages, newMessage])
  }

  const handleRun = async (issue: SelectIssue) => {
    setIsRunning(true)
    try {
      // Implement the run logic here
      // This is a placeholder implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      await createIssueMessageRecord({
        issueId: issue.id,
        content: "Issue run started",
        sequence: sequenceRef.current++
      })
      await updateIssue(issue.id, { status: "in_progress" })
      await fetchMessages()
    } catch (error) {
      console.error("Error running issue:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleRerun = async (issue: SelectIssue) => {
    setIsRunning(true)
    try {
      // Implement the rerun logic here
      // This is a placeholder implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      await createIssueMessageRecord({
        issueId: issue.id,
        content: "Issue rerun started",
        sequence: sequenceRef.current++
      })
      await updateIssue(issue.id, { status: "in_progress" })
      await fetchMessages()
    } catch (error) {
      console.error("Error rerunning issue:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const renderStepContent = () => {
    const lastMessage = messages[messages.length - 1]?.content || ""

    switch (currentStep) {
      case "think":
        return (
          <CodegenThoughts
            response={MOCK_THINK_DATA}
            onUpdate={updatedThoughts => {
              console.log("Updated thoughts:", updatedThoughts)
            }}
          />
        )
      case "clarify":
        return <div>Clarification step content</div>
      case "plan":
        return <div>Planning step content</div>
      case "act":
        return <div>Action step content</div>
      case "verify":
        return <div>Verification step content</div>
      default:
        return null
    }
  }

  return (
    <CRUDPage
      pageTitle={`Run: ${issue.name}`}
      backText="Back to Issue"
      backLink={`/${workspaceId}/${projectId}/issues/${issueId}`}
    >
      <div className="flex w-full justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              variant="create"
              size="sm"
              onClick={() =>
                issue.status === "completed"
                  ? handleRerun(issue)
                  : handleRun(issue)
              }
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Running...
                </>
              ) : issue.status === "completed" ? (
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
          </div>

          <Card className="mt-6">
            <CardContent className="bg-secondary/50 p-4">
              <MessageMarkdown content={issue.content} />
            </CardContent>
          </Card>
        </div>

        <div>
          {currentStep && <div className="mb-6">{renderStepContent()}</div>}

          <div className="space-y-8">
            {messages.map(message => (
              <Card key={message.id}>
                <CardContent className="bg-secondary p-4">
                  <MessageMarkdown content={message.content} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </CRUDPage>
  )
}
