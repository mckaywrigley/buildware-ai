"use client"

import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import { stepOrder, useRunIssue } from "@/lib/hooks/use-run-issue"
import { StepName } from "@/types/run"
import { ArrowLeft, Info, Loader2, Play, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RunStepContent } from "./run-step-content"
import { RunStepStatusList } from "./run-step-status-list"
import { getContextGroups } from "@/actions/context-groups"

interface RunIssueProps {
  issue: SelectIssue
  project: SelectProject
  instructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
}

export const RunIssue = ({ issue, project, instructions }: RunIssueProps) => {
  const router = useRouter()
  const [selectedStep, setSelectedStep] = useState<StepName | null>(null)
  const [contextGroups, setContextGroups] = useState<SelectContextGroup[]>([])
  const [selectedContextGroupId, setSelectedContextGroupId] = useState<string | null>(null)
  const {
    isRunning,
    currentStep,
    handleRun,
    handleConfirmation,
    waitingForConfirmation,
    stepStatuses,
    setParsedPlan,
    setParsedSpecification,
    parsedPlan,
    parsedSpecification
  } = useRunIssue(issue, project, instructions, selectedContextGroupId)

  useEffect(() => {
    setSelectedStep(null)
  }, [currentStep])

  useEffect(() => {
    const fetchContextGroups = async () => {
      try {
        const groups = await getContextGroups(project.id)
        setContextGroups(groups)
      } catch (error) {
        console.error("Error fetching context groups:", error)
      }
    }

    fetchContextGroups()
  }, [project.id])

  const handleStepClick = (step: StepName) => {
    const currentStepIndex = currentStep ? stepOrder.indexOf(currentStep) : -1
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

            <div className="truncate font-bold">{issue.name}</div>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={selectedContextGroupId || ""}
              onValueChange={(value) => setSelectedContextGroupId(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select context group" />
              </SelectTrigger>
              <SelectContent>
                {contextGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {waitingForConfirmation ? (
              <Button
                variant="create"
                onClick={handleConfirmation}
                className="ml-4"
              >
                <Play className="mr-2 size-4" />
                Confirm and Continue
              </Button>
            ) : (
              <Button
                variant="create"
                onClick={handleRun}
                disabled={isRunning}
                className="ml-4"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Running
                  </>
                ) : issue.status === "completed" ? (
                  <>
                    <RefreshCw className="mr-2 size-4" />
                    Redo Run
                  </>
                ) : (
                  <>
                    <Play className="mr-2 size-4" />
                    Begin Run
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="grid size-full grid-cols-12">
          <div className="col-span-4 overflow-y-auto border-r p-4">
            <RunStepStatusList
              currentStep={currentStep}
              waitingForConfirmation={waitingForConfirmation}
              onStepClick={handleStepClick}
              stepStatuses={stepStatuses}
            />
          </div>

          <div className="col-span-8 overflow-y-auto p-6">
            <RunStepContent
              stepName={selectedStep || currentStep}
              parsedPlan={parsedPlan}
              setParsedPlan={setParsedPlan}
              parsedSpecification={parsedSpecification}
              setParsedSpecification={setParsedSpecification}
            />
          </div>
        </div>
      </div>
    </>
  )
}