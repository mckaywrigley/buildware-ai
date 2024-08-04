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
import { createRun, updateRunStatus, createRunStep, updateRunStep, getLastIncompleteRun, getRunWithSteps } from "@/db/queries/runs-queries"
import { SelectRun, SelectRunStep } from "@/db/schema/runs-schema"
import { formatCurrency } from "@/lib/utils"

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

interface RunDashboardProps {
  issue: SelectIssue
  project: SelectProject
  instructions: SelectInstruction[]
}

export const RunDashboard = ({
  issue,
  project,
  instructions
}: RunDashboardProps) => {
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
  const [implementationResponse, setImplementationResponse] = useState("")
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
  const [currentRun, setCurrentRun] = useState<SelectRun | null>(null)
  const [currentRunStep, setCurrentRunStep] = useState<SelectRunStep | null>(null)

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
    const loadIncompleteRun = async () => {
      const incompleteRun = await getLastIncompleteRun(issue.id)
      if (incompleteRun) {
        const runWithSteps = await getRunWithSteps(incompleteRun.id)
        setCurrentRun(runWithSteps)
        const lastCompletedStep = runWithSteps.steps
          .filter(step => step.status === "done")
          .pop()
        if (lastCompletedStep) {
          const nextStepIndex = stepOrder.indexOf(lastCompletedStep.stepName as StepName) + 1
          setCurrentStep(stepOrder[nextStepIndex])
          updateStepStatus(lastCompletedStep.stepName as StepName, "done")
        }
      }
    }
    loadIncompleteRun()
  }, [issue.id])

  const updateStepStatus = (step: StepName, status: StepStatus) => {
    setStepStatuses(prevSteps => ({ ...prevSteps, [step]: status }))
  }

  const runNextStep = async (step: StepName) => {
    const stepStatus = stepStatuses[step]

    if (stepStatus === "not_started") {
      updateStepStatus(step, "in_progress")
      try {
        const runStep = await createRunStep(currentRun!.id, step)
        setCurrentRunStep(runStep)
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
              project
            })
            setLatestCodebaseFiles(
              retrievalStepResponse.codebaseFiles.map(file => ({
                path: file.path,
                content: file.content || ""
              }))
            )
            setWaitingForConfirmation(true)
            return
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
            return
          case "plan":
            const planStepResponse = await runPlanStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext,
              specification: specificationResponse
            })
            setPlanResponse(planStepResponse.planResponse)
            setParsedPlan(planStepResponse.parsedPlan)
            setWaitingForConfirmation(true)
            return
          case "implementation":
            const implementationStepResponse = await runImplementationStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext,
              plan: planResponse
            })
            setParsedImplementation(
              implementationStepResponse.parsedImplementation
            )
            setWaitingForConfirmation(true)
            return
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

        await updateRunStep(runStep.id, { status: "done" })
        handleStepCompletion(step, stepOrder.indexOf(step))
      } catch (error) {
        console.error("Error running step:", error)
        await updateRunStep(currentRunStep!.id, { status: "error" })
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
      updateRunStatus(currentRun!.id, "completed")
    } else {
      setCurrentStep(nextStep)
      runNextStep(nextStep)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setWaitingForConfirmation(false)
    const { run, step } = await createRunWithFirstStep(issue.id, "started")
    setCurrentRun(run)
    setCurrentRunStep(step)
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

  const updateParsedSpecification = (
    updatedSpecification: ParsedSpecification
  ) => {
    setParsedSpecification(updatedSpecification)

    const xmlSpecification = `<specification>
${updatedSpecification.steps.map(step => `  <step>${step.text}</step>`).join("\n")}
</specification>`

    setSpecificationResponse(xmlSpecification)
  }

  const updateParsedPlan = (updatedPlan: ParsedPlan) => {
    setParsedPlan(updatedPlan)

    const xmlPlan = `<plan>
${updatedPlan.steps.map(step => `  <step>${step.text}</step>`).join("\n")}
</plan>`

    setPlanResponse(xmlPlan)
  }

  const updateParsedImplementation = (
    updatedImplementation: ParsedImplementation
  ) => {
    setParsedImplementation(updatedImplementation)

    const xmlImplementation = `<pull_request>
  <pr_title>${updatedImplementation.prTitle}</pr_title>
  <pr_description>${updatedImplementation.prDescription}</pr_description>
${updatedImplementation.files
  .map(
    file => `  <file>
    <file_status>${file.status}</file_status>
    <file_path>${file.path}</file_path>
    <file_content>${file.content}