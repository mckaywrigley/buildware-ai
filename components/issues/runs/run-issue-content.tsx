import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { SelectIssue, SelectIssueMessage } from "@/db/schema"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { Loader2, Play, RefreshCw } from "lucide-react"
import { FC } from "react"
import { StepContent } from "./run-step-content"

interface RunIssueContentProps {
  issue: SelectIssue
  isRunning: boolean
  currentStep:
    | "started"
    | "embedding"
    | "retrieval"
    | "clarify"
    | "think"
    | "plan"
    | "act"
    | "verify"
    | "pr"
    | "completed"
    | null
  messages: SelectIssueMessage[]
  clarifications: AIClarificationItem[]
  thoughts: AIThought[]
  planSteps: AIPlanStep[]
  generatedFiles: AIFileInfo[]
  onRun: () => void
}

export const RunIssueContent: FC<RunIssueContentProps> = ({
  issue,
  isRunning,
  currentStep,
  messages,
  clarifications,
  thoughts,
  planSteps,
  generatedFiles,
  onRun
}) => {
  return (
    <div className="flex flex-col gap-12">
      <Button variant="create" onClick={onRun} disabled={isRunning}>
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

      {currentStep && (
        <StepContent
          step={currentStep}
          clarifications={clarifications}
          thoughts={thoughts}
          planSteps={planSteps}
          generatedFiles={generatedFiles}
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
  )
}
