import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SelectIssue, SelectIssueMessage } from "@/db/schema"
import { trackRunProgress } from "@/lib/runs/track-run-progress"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { RunStep } from "@/types/run"
import { Loader2, Play, RefreshCw } from "lucide-react"
import { FC } from "react"
import { RunStepContent } from "./run-step-content"

interface RunIssueContentProps {
  issue: SelectIssue
  isRunning: boolean
  currentStep: RunStep
  messages: SelectIssueMessage[]
  clarifications: AIClarificationItem[]
  thoughts: AIThought[]
  planSteps: AIPlanStep[]
  generatedFiles: AIFileInfo[]
  setPlanSteps: (planSteps: AIPlanStep[]) => void
  setGeneratedFiles: (generatedFiles: AIFileInfo[]) => void
  setClarifications: (clarifications: AIClarificationItem[]) => void
  onRun: () => void
  setThoughts: (updatedThoughts: AIThought[]) => void
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
  setPlanSteps,
  setGeneratedFiles,
  setClarifications,
  onRun,
  setThoughts
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

      <Progress value={trackRunProgress(currentStep)} />

      {currentStep && (
        <RunStepContent
          step={currentStep}
          clarifications={clarifications}
          thoughts={thoughts}
          planSteps={planSteps}
          generatedFiles={generatedFiles}
          setPlanSteps={setPlanSteps}
          setGeneratedFiles={setGeneratedFiles}
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
  )
}
