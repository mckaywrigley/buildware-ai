"use client"

import {
  SelectInstruction,
  SelectIssue,
  SelectIssueMessage,
  SelectProject
} from "@/db/schema"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { useState } from "react"
import { runIssueWorkflow } from "../runs/run-issue-workflow"

export const useRunIssue = (
  issue: SelectIssue,
  initialIssueMessages: SelectIssueMessage[],
  project: SelectProject,
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<
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
  >(null)
  const [messages, setMessages] =
    useState<SelectIssueMessage[]>(initialIssueMessages)
  const [clarifications, setClarifications] = useState<AIClarificationItem[]>(
    []
  )
  const [thoughts, setThoughts] = useState<AIThought[]>([])
  const [planSteps, setPlanSteps] = useState<AIPlanStep[]>([])
  const [generatedFiles, setGeneratedFiles] = useState<AIFileInfo[]>([])

  const handleRun = async () => {
    if (!project.githubRepoFullName || !project.githubTargetBranch) {
      alert("Please connect your project to a GitHub repository first.")
      return
    }

    setIsRunning(true)
    try {
      await runIssueWorkflow({
        issue,
        project,
        attachedInstructions,
        setCurrentStep,
        setMessages,
        setClarifications,
        setThoughts,
        setPlanSteps,
        setGeneratedFiles
      })
    } catch (error) {
      console.error("Error running issue:", error)
    } finally {
      setIsRunning(false)
    }
  }

  return {
    isRunning,
    currentStep,
    messages,
    clarifications,
    thoughts,
    planSteps,
    generatedFiles,
    handleRun
  }
}
