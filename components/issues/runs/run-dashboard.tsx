"use client"

import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
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
import { createRun, createRunStep, getRun, updateRun, updateRunStep } from "@/db/queries/runs-queries"
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
  const [runId, setRunId] = useState<string | null>(null)
  const [totalCost, setTotalCost] = useState(0)

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
    const loadExistingRun = async () => {
      const existingRun = await getRun(issue.id)
      if (existingRun && existingRun.status !== "completed") {
        setRunId(existingRun.id)
        setTotalCost(Number(existingRun.totalCost))
        const lastCompletedStepIndex = existingRun.steps
          .filter(step => step.status === "done")
          .reduce((maxIndex, step) => {
            const index = stepOrder.indexOf(step.stepName as StepName)
            return index > maxIndex ? index : maxIndex
          }, -1)
        const nextStepIndex = lastCompletedStepIndex + 1
        if (nextStepIndex < stepOrder.length) {
          setCurrentStep(stepOrder[nextStepIndex])
          const updatedStepStatuses = { ...stepStatuses }
          for (let i = 0; i <= lastCompletedStepIndex; i++) {
            updatedStepStatuses[stepOrder[i]] = "done"
          }
          setStepStatuses(updatedStepStatuses)
        }
      }
    }
    loadExistingRun()
  }, [issue.id])

  const updateStepStatus = (step: StepName, status: StepStatus) => {
    setStepStatuses(prevSteps => ({ ...prevSteps, [step]: status }))
  }

  const runNextStep = async (step: StepName) => {
    const stepStatus = stepStatuses[step]

    if (stepStatus === "not_started") {
      updateStepStatus(step, "in_progress")
      try {
        let stepCost = 0
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
            stepCost = specificationStepResponse.cost
            setWaitingForConfirmation(true)
            break
          case "plan":
            const planStepResponse = await runPlanStep({
              issue,
              codebaseFiles: latestCodebaseFiles,
              instructionsContext,
              specification: specificationResponse
            })
            setPlanResponse(planStepResponse.planResponse)
            setParsedPlan(planStepResponse.parsedPlan)
            stepCost = planStepResponse.cost
            setWaitingForConfirmation(true)
            break
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
            stepCost = implementationStepResponse.cost
            setWaitingForConfirmation(true)
            break
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

        setTotalCost(prevCost => prevCost + stepCost)
        await updateRun(runId!, { totalCost: totalCost + stepCost })
        await updateRunStep(runId!, step, {
          status: "done",
          cost: stepCost,
          response: JSON.stringify({
            specificationResponse,
            planResponse,
            implementationResponse,
            prLink
          })
        })

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
      updateRun(runId!, { status: "completed" })
    } else {
      setCurrentStep(nextStep)
      runNextStep(nextStep)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setWaitingForConfirmation(false)
    if (!runId) {
      const newRun = await createRun({
        projectId: project.id,
        issueId: issue.id,
        status: "in_progress"
      })
      setRunId(newRun.id)
    } else {
      await updateRun(runId, { status: "in_progress" })
    }
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