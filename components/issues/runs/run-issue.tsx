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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { updateIssue } from "@/db/queries"
import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import { runCompletedStep } from "@/lib/runs/run-completed-step"
import { runEmbeddingStep } from "@/lib/runs/run-embedding-step"
import { runImplementationStep } from "@/lib/runs/run-implementation-step"
import { runPlanStep } from "@/lib/runs/run-plan-step"
import { runPRStep } from "@/lib/runs/run-pr-step"
import { runRetrievalStep } from "@/lib/runs/run-retrieval-step"
import { runSpecificationStep } from "@/lib/runs/run-specification-step"
import { runStartStep } from "@/lib/runs/run-start-step"
import {
  ParsedImplementation,
  ParsedPlan,
  ParsedSpecification,
  RunStepStatuses,
  StepName,
  StepStatus
} from "@/types/run"
import { ArrowLeft, Info, Loader2, Play, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RunStepContent } from "./run-step-content"
import { RunStepStatusList } from "./run-step-status-list"
import { getContextGroups } from "@/actions/context-groups/get-context-groups"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const stepOrder: StepName[] = [
  "started",
  "embedding",
  "retrieval",
  "specification",
  "plan",
  "implementation",
  "pr",
  "completed"
]

interface RunIssueProps {
  issue: SelectIssue
  project: SelectProject
  instructions: SelectInstruction[]
}

export const RunIssue = ({ issue, project, instructions }: RunIssueProps) => {
  const router = useRouter()
  const [selectedStep, setSelectedStep] = useState<StepName | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<StepName | null>(null)
  const [stepStatuses, setStepStatuses] = useState<RunStepStatuses>({
    started: "not_started",
    embedding: "not_started",
    retrieval: "not_started",
    specification: "not_started",
    plan: "not_started",
    implementation: "not_started",
    pr: "not_started",
    completed: "not_started"
  })
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false)
  const [prLink, setPrLink] = useState("")
  const [specificationResponse, setSpecificationResponse] = useState("")
  const [parsedSpecification, setParsedSpecification] =
    useState<ParsedSpecification>({ steps: [] })
  const [planResponse, setPlanResponse] = useState("")
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan>({ steps: [] })
  const [parsedImplementation, setParsedImplementation] =
    useState<ParsedImplementation>({
      files: [],
      prTitle: "",
      prDescription: ""
    })
  const [latestCodebaseFiles, setLatestCodebaseFiles] = useState<
    { path: string; content: string }[]
  >([])
  const [contextGroups, setContextGroups] = useState<{ id: string; name: string }[]>([])
  const [selectedContextGroupIds, setSelectedContextGroupIds] = useState<string[]>([])

  const instructionsContext = instructions
    .map(
      instruction =>
        `<instruction name="${instruction.name}">
${instruction.content}
</instruction>`
    )
    .join("\n\n")

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

  const updateStepStatus = (step: StepName, status: StepStatus) => {
    setStepStatuses(prevSteps => ({ ...prevSteps, [step]: status }))
  }

  const runNextStep = async (step: StepName) => {
    const stepStatus = stepStatuses[step]

    if (stepStatus === "not_started") {
      updateStepStatus(step, "in_progress")
      try {
        switch (step) {
          case "started":
            await runStartStep()
            break
          case "embedding":
            await runEmbeddingStep({ project })
            break
          case "retrieval":
            const retrievalStepResponse = await runRetrievalStep({
              issue,
              project,
              selectedContextGroupIds
            })
            setLatestCodebaseFiles(
              retrievalStepResponse.codebaseFiles.map(file => ({
                path: file.path,
                content: file.content || ""
              }))
            )
            setWaitingForConfirmation(true)
            return // Exit function here
          case "specification":
            const specificationStepResponse = await runSpecificationStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext
            })
            setSpecificationResponse(
              specificationStepResponse.specificationResponse
            )
            setParsedSpecification(
              specificationStepResponse.parsedSpecification
            )
            setWaitingForConfirmation(true)
            return // Exit function here
          case "plan":
            const planStepResponse = await runPlanStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext,
              specificationResponse
            })
            setPlanResponse(planStepResponse.planResponse)
            setParsedPlan(planStepResponse.parsedPlan)
            setWaitingForConfirmation(true)
            return // Exit function here
          case "implementation":
            const implementationStepResponse = await runImplementationStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext,
              planResponse
            })
            setParsedImplementation(
              implementationStepResponse.parsedImplementation
            )
            setWaitingForConfirmation(true)
            return // Exit function here
          case "pr":
            const prStepResponse = await runPRStep({
              issue,
              project,
              parsedImplementation
            })
            setPrLink(prStepResponse.prLink)
            break
          case "completed":
            await runCompletedStep()
            updateIssue(issue.id, { status: "completed" })
            break
        }

        handleStepCompletion(step, stepOrder.indexOf(step))
      } catch (error) {
        console.error("Error running step:", error)
        updateStepStatus(step, "error")
      }
    }
  }

  const handleConfirmation = () => {
    setWaitingForConfirmation(false)
    if (currentStep) {
      handleStepCompletion(currentStep, stepOrder.indexOf(currentStep))
    }
  }

  const handleStepCompletion = (stepName: StepName, stepIndex: number) => {
    updateStepStatus(stepName, "done")
    const nextStep = stepOrder[stepIndex + 1]
    const isLastStep = stepIndex === stepOrder.length - 1

    if (isLastStep) {
      setIsRunning(false)
    } else {
      setCurrentStep(nextStep)
      runNextStep(nextStep)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setWaitingForConfirmation(false)
    setCurrentStep("started")
    runNextStep("started")
  }

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
              value={selectedContextGroupIds.join(",")}
              onValueChange={(value) => setSelectedContextGroupIds(value.split(","))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select context groups" />
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
              parsedImplementation={parsedImplementation}
              setParsedImplementation={setParsedImplementation}
              prLink={prLink}
            />
          </div>
        </div>
      </div>
    </>
  )
}