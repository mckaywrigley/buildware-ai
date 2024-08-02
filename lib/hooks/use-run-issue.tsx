"use client"

import { updateIssue } from "@/db/queries"
import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import {
  ParsedImplementation,
  ParsedPlan,
  ParsedSpecification,
  RunStepStatuses,
  StepName,
  StepStatus
} from "@/types/run"
import { useRef, useState } from "react"
import { runCompletedStep } from "../runs/run-completed-step"
import { runEmbeddingStep } from "../runs/run-embedding-step"
import { runImplementationStep } from "../runs/run-implementation-step"
import { runPlanStep } from "../runs/run-plan-step"
import { runPRStep } from "../runs/run-pr-step"
import { runRetrievalStep } from "../runs/run-retrieval-step"
import { runSpecificationStep } from "../runs/run-specification-step"
import { runStartStep } from "../runs/run-start-step"

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

export const useRunIssue = (
  issue: SelectIssue,
  project: SelectProject,
  instructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
) => {
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
  const [implementationResponse, setImplementationResponse] = useState("")
  const [parsedImplementation, setParsedImplementation] =
    useState<ParsedImplementation>({
      files: [],
      prTitle: "",
      prDescription: ""
    })

  const updateStepStatus = (step: StepName, status: StepStatus) => {
    setStepStatuses(prevSteps => ({ ...prevSteps, [step]: status }))
  }

  const stepFunctions = [
    runStartStep,
    runEmbeddingStep,
    runRetrievalStep,
    runSpecificationStep,
    runPlanStep,
    runImplementationStep,
    runPRStep,
    runCompletedStep
  ]

  const latestCodebaseFiles = useRef<{ path: string; content: string }[]>([])
  const latestInstructionsContext = useRef("")

  const runNextStep = async (step: StepName) => {
    await new Promise(resolve => setTimeout(resolve, 500)) // wait 0.5s for animation

    const stepIndex = stepOrder.indexOf(step)

    if (stepIndex < stepFunctions.length) {
      const currentStepFunction = stepFunctions[stepIndex]
      const stepName = stepOrder[stepIndex]

      updateStepStatus(stepName, "in_progress")

      try {
        const result = await currentStepFunction({
          codebaseFiles: latestCodebaseFiles.current,
          issue,
          instructions,
          instructionsContext: latestInstructionsContext.current,
          project,
          parsedPlan,
          planResponse,
          specificationResponse,
          parsedSpecification,
          implementationResponse,
          parsedImplementation,
          stepStatuses,
          setParsedSpecification,
          setSpecificationResponse,
          setPlanResponse,
          setParsedPlan,
          setImplementationResponse,
          setParsedImplementation,
          setStepStatuses,
          setPrLink
        })

        if (result) {
          // Retrieval Step
          if ("codebaseFiles" in result && result.codebaseFiles) {
            latestCodebaseFiles.current = result.codebaseFiles.map(file => ({
              path: file.path,
              content: file.content!
            }))
          }
          if ("instructionsContext" in result && result.instructionsContext) {
            latestInstructionsContext.current = result.instructionsContext
          }
        }

        const isConfirmationStep = ["specification", "plan"].includes(stepName)
        updateStepStatus(stepName, "done")
        setCurrentStep(isConfirmationStep ? stepName : stepOrder[stepIndex + 1])

        if (!isConfirmationStep) {
          runNextStep(stepOrder[stepIndex + 1])
        }

        setWaitingForConfirmation(isConfirmationStep)
        await updateIssue(issue.id, {
          status: isConfirmationStep ? stepName : "retrieval"
        })
      } catch (error) {
        console.error(`Error in step ${stepName}:`, error)
        updateStepStatus(stepName, "error")
        setIsRunning(false)
        return
      }
    } else {
      setIsRunning(false)
    }
  }

  const handleRun = async () => {
    if (!project.githubRepoFullName || !project.githubTargetBranch) {
      alert("Please connect your project to a GitHub repository first.")
      return
    }

    setIsRunning(true)
    setCurrentStep(stepOrder[0])
    runNextStep(stepOrder[0])
  }

  const handleConfirmation = () => {
    setWaitingForConfirmation(false)
    if (currentStep) {
      updateStepStatus(currentStep, "done")
      const nextStepIndex = stepOrder.indexOf(currentStep) + 1
      const nextStep = stepOrder[nextStepIndex]
      setCurrentStep(nextStep)
      runNextStep(nextStep)
    }
  }

  return {
    codebaseFiles: latestCodebaseFiles.current,
    currentStep,
    handleConfirmation,
    handleRun,
    instructionsContext: latestInstructionsContext.current,
    isRunning,
    prLink,
    setPrLink,
    stepStatuses,
    updateStepStatus,
    waitingForConfirmation,
    parsedPlan,
    setParsedPlan,
    parsedSpecification,
    setParsedSpecification
  }
}
