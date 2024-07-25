"use client"

import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  SelectInstruction,
  SelectIssue,
  SelectIssueMessage,
  SelectProject
} from "@/db/schema"
import { useRunIssue } from "@/lib/hooks/use-run-issue"
import { trackRunProgress } from "@/lib/runs/track-run-progress"
import { Loader2, Play, RefreshCw } from "lucide-react"
import { FC } from "react"
import { RunStepContent } from "./run-step-content"

interface RunIssueProps {
  issue: SelectIssue
  initialIssueMessages: SelectIssueMessage[]
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
}

export const RunIssue: FC<RunIssueProps> = ({
  issue,
  initialIssueMessages,
  project,
  attachedInstructions
}) => {
  const {
    isRunning,
    currentStep,
    messages,
    clarifications,
    thoughts,
    planSteps,
    handleRun,
    setThoughts,
    setClarifications,
    setPlanSteps,
    handleConfirmation,
    waitingForConfirmation
  } = useRunIssue(issue, initialIssueMessages, project, attachedInstructions)

  return (
    <CRUDPage pageTitle={`Run issue`} backText="Back to issue" backLink={`./`}>
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
              Redo Run
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

        <Progress value={trackRunProgress(currentStep)} />

        {waitingForConfirmation && (
          <Button onClick={handleConfirmation}>Confirm and Continue</Button>
        )}

        {currentStep && (
          <RunStepContent
            step={currentStep}
            clarifications={clarifications}
            thoughts={thoughts}
            planSteps={planSteps}
            setPlanSteps={setPlanSteps}
            setThoughts={setThoughts}
            setClarifications={setClarifications}
          />
        )}

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
