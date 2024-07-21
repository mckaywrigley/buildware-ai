"use client"

import { CodegenThoughts } from "@/components/codegen/think/codegen-thoughts"
import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { createIssueMessage, updateIssue } from "@/db/queries"
import { SelectIssue, SelectIssueMessage } from "@/db/schema"
import { MOCK_THINK_DATA } from "@/lib/constants/codegen-mock-data/think/mock-think-data"
import { Loader2, Play, RefreshCw } from "lucide-react"
import { FC, useRef, useState } from "react"
import { CRUDPage } from "../dashboard/reusable/crud-page"

interface RunIssueProps {
  issue: SelectIssue
  initialIssueMessages: SelectIssueMessage[]
}

export const RunIssue: FC<RunIssueProps> = ({
  issue,
  initialIssueMessages
}) => {
  const [isRunning, setIsRunning] = useState(false)
  const [messages, setMessages] = useState(initialIssueMessages)
  const [currentStep, setCurrentStep] = useState<
    "clarify" | "think" | "plan" | "act" | "verify" | null
  >("think")

  const sequenceRef = useRef(initialIssueMessages.length + 1)

  const handleRun = async () => {
    setIsRunning(true)
    try {
      await updateIssue(issue.id, { status: "in_progress" })
      await createIssueMessage({
        issueId: issue.id,
        content: "Issue run started",
        sequence: sequenceRef.current++
      })

      // CLARIFY --------------------
      setCurrentStep("clarify")

      // THINK --------------------
      setCurrentStep("think")

      // PLAN --------------------
      setCurrentStep("plan")

      // ACT --------------------
      setCurrentStep("act")

      // VERIFY --------------------
      setCurrentStep("verify")
    } catch (error) {
      console.error("Error running issue:", error)
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
      pageTitle={`Running issue`}
      backText="Back to issue"
      backLink={`./`}
    >
      <div className="flex flex-col gap-12">
        <Button variant="create" onClick={handleRun} disabled={isRunning}>
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
              Start Run
            </>
          )}
        </Button>

        <Card className="bg-secondary/50 flex flex-col gap-2 p-4">
          <CardTitle>{issue.name}</CardTitle>

          <CardContent className="p-0">
            <MessageMarkdown content={issue.content} />
          </CardContent>
        </Card>

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
    </CRUDPage>
  )
}
