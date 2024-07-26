"use client"

import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  SelectInstruction,
  SelectIssue,
  SelectIssueMessage,
  SelectProject
} from "@/db/schema"
import { useRunIssue } from "@/lib/hooks/use-run-issue"
import { trackRunProgress } from "@/lib/runs/track-run-progress"
import { Loader2, Play, RefreshCw, Info, ArrowLeft } from "lucide-react"
import { FC, useState, useEffect } from "react"
import { RunStepContent } from "./run-step-content"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { IssueMessages } from "./issue-messages"
import { RunStep } from "@/types/run"

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
  const router = useRouter()
  const [selectedStep, setSelectedStep] = useState<RunStep | null>(null)
  const {
    isRunning,
    currentStep,
    //messages,
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

  useEffect(() => {
    setSelectedStep(null)
  }, [currentStep])

  const stepOrder: RunStep[] = [
    "started",
    "embedding",
    "retrieval",
    //"clarify",
    "think",
    "plan",
    "act",
    "pr",
    //"verify",
    "completed"
  ]

  const handleStepClick = (step: RunStep) => {
    const currentStepIndex = stepOrder.indexOf(currentStep)
    const clickedStepIndex = stepOrder.indexOf(step)

    if (clickedStepIndex <= currentStepIndex) {
      setSelectedStep(step)
    }
  }

  return (
    <>
      <div className="w-full border-b">
        <div className="flex h-14 items-center justify-between px-4 lg:h-[59px]">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push(`.`)}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
            <TooltipProvider>
              <Tooltip>
                <Dialog>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Info className="size-4" />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{issue.name}</DialogTitle>
                    </DialogHeader>
                    <MessageMarkdown content={issue.content} />
                  </DialogContent>
                </Dialog>
                <TooltipContent>
                  <div>View your issue</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-full max-w-2xl">
            <Progress
              value={trackRunProgress(currentStep)}
              className="w-full"
            />
          </div>
          <Button
            variant="create"
            onClick={handleRun}
            disabled={isRunning}
            className="ml-4"
          >
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
        </div>
      </div>
      <div className="flex flex-1">
        <div className="grid w-full grid-cols-12 gap-8 pb-16">
          <div className="col-span-4 p-4">
            <IssueMessages
              currentStep={currentStep}
              waitingForConfirmation={waitingForConfirmation}
              onStepClick={handleStepClick}
            />
          </div>
          <div className="col-span-8 p-6">
            <RunStepContent
              step={selectedStep || currentStep}
              clarifications={clarifications}
              thoughts={thoughts}
              planSteps={planSteps}
              setPlanSteps={setPlanSteps}
              setThoughts={setThoughts}
              setClarifications={setClarifications}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "bg-background fixed bottom-0 left-[280px] right-0 border-t p-4 transition-all duration-300 ease-in-out",
          waitingForConfirmation ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex justify-end">
          <Button onClick={handleConfirmation}>Confirm and Continue</Button>
        </div>
      </div>
    </>
  )
}
