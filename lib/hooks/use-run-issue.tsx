"use client"

import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { RunStepStatuses, StepName, StepStatus } from "@/types/run"
import { useState } from "react"
import { parseCodegenActResponse } from "../ai/codegen-system/act/parse-codegen-act-response"
import { runActStep } from "../runs/run-act-step"
import { runCompletedStep } from "../runs/run-completed-step"
import { runEmbeddingStep } from "../runs/run-embedding-step"
import { runPlanStep } from "../runs/run-plan-step"
import { runPRStep } from "../runs/run-pr-step"
import { runRetrievalStep } from "../runs/run-retrieval-step"
import { runStartStep } from "../runs/run-start-step"
import { runThinkStep } from "../runs/run-think-step"

export const useRunIssue = (
  issue: SelectIssue,
  project: SelectProject,
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<StepName | null>(null)
  const [clarifications, setClarifications] = useState<AIClarificationItem[]>(
    []
  )
  const [thoughts, setThoughts] = useState<AIThought[]>([])
  const [planSteps, setPlanSteps] = useState<AIPlanStep[]>([])
  const [generatedFiles, setGeneratedFiles] = useState<AIFileInfo[]>([])
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [codebaseFiles, setCodebaseFiles] = useState<
    { path: string; content: string }[]
  >([])
  const [instructionsContext, setInstructionsContext] = useState("")
  const [aiResponses, setAIResponses] = useState<{
    clarify: string | null
    think: string | null
    plan: string | null
    act: string | null
  }>({
    clarify: null,
    think: null,
    plan: null,
    act: null
  })

  const [stepStatuses, setStepStatuses] = useState<RunStepStatuses>({
    started: "not_started",
    embedding: "not_started",
    retrieval: "not_started",
    think: "not_started",
    plan: "not_started",
    act: "not_started",
    pr: "not_started",
    completed: "not_started",
    // unimplemented steps
    clarify: "not_started",
    verify: "not_started"
  })

  const updateStepStatus = (step: StepName, status: StepStatus) => {
    setStepStatuses(prevSteps => ({ ...prevSteps, [step]: status }))
  }

  const stepFunctions = [
    runStartStep,
    runEmbeddingStep,
    runRetrievalStep,
    runThinkStep,
    runPlanStep,
    runActStep,
    runPRStep,
    runCompletedStep
  ]

  const stepNames: StepName[] = [
    "started",
    "embedding",
    "retrieval",
    "think",
    "plan",
    "act",
    "pr",
    "completed"
  ]

  const runNextStep = async (stepIndex = currentStepIndex) => {
    await new Promise(resolve => setTimeout(resolve, 500)) // wait 0.5s for animation

    if (stepIndex < stepFunctions.length) {
      const currentStepFunction = stepFunctions[stepIndex]
      const stepName = stepNames[stepIndex]

      updateStepStatus(stepName, "in_progress")

      try {
        await currentStepFunction({
          issue,
          project,
          attachedInstructions,
          setCurrentStep,
          setClarifications,
          setThoughts,
          setPlanSteps,
          setGeneratedFiles,
          codebaseFiles,
          instructionsContext,
          clarifyAIResponse: aiResponses.clarify ?? "",
          thinkAIResponse: aiResponses.think ?? "",
          planAIResponse: aiResponses.plan ?? "",
          actAIResponse: aiResponses.act ?? "",
          parsedActResponse: aiResponses.act
            ? parseCodegenActResponse(aiResponses.act)
            : null,
          stepStatuses,
          setStepStatuses,
          setCodebaseFiles,
          setInstructionsContext,
          setAIResponses: (type: keyof typeof aiResponses, response: string) =>
            setAIResponses(prev => ({ ...prev, [type]: response })),
          updateStepStatus: (status: StepStatus) =>
            updateStepStatus(stepName, status)
        })

        // If the step is think or plan, we need to wait for confirmation
        if (["think", "plan"].includes(stepName)) {
          setWaitingForConfirmation(true)
          setCurrentStepIndex(stepIndex)
        } else {
          updateStepStatus(stepName, "done")
          const nextStepIndex = stepIndex + 1
          setCurrentStepIndex(nextStepIndex)
          runNextStep(nextStepIndex)
        }
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
    setCurrentStepIndex(0)
    runNextStep(0)
  }

  const handleConfirmation = () => {
    setWaitingForConfirmation(false)
    updateStepStatus(stepNames[currentStepIndex], "done")
    const nextStepIndex = currentStepIndex + 1
    setCurrentStepIndex(nextStepIndex)
    runNextStep(nextStepIndex)
  }

  return {
    isRunning,
    currentStep,
    clarifications,
    thoughts,
    planSteps,
    generatedFiles,
    waitingForConfirmation,
    handleRun,
    setThoughts,
    setClarifications,
    setPlanSteps,
    setGeneratedFiles,
    handleConfirmation,
    stepStatuses,
    updateStepStatus
  }
}
