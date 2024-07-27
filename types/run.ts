import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import {
  AIClarificationItem,
  AIFileInfo,
  AIParsedActResponse,
  AIPlanStep,
  AIThought
} from "@/types/ai"

export type StepName =
  | "started"
  | "embedding"
  | "retrieval"
  | "think"
  | "plan"
  | "act"
  | "pr"
  | "completed"
  // unimplemented steps
  | "clarify"
  | "verify"

export type StepStatus = "not_started" | "in_progress" | "done" | "error"

export type RunStep = {
  [key in StepName]: StepStatus
}

export interface RunStepParams {
  // Core data
  issue: SelectIssue
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]

  // State setters
  setCurrentStep: (step: StepName) => void
  setClarifications: (clarifications: AIClarificationItem[]) => void
  setThoughts: (thoughts: AIThought[]) => void
  setPlanSteps: (planSteps: AIPlanStep[]) => void
  setGeneratedFiles: (files: AIFileInfo[]) => void
  setCodebaseFiles: React.Dispatch<
    React.SetStateAction<{ path: string; content: string }[]>
  >
  setInstructionsContext: React.Dispatch<React.SetStateAction<string>>
  setAIResponses: (
    type: "clarify" | "think" | "plan" | "act",
    response: string
  ) => void

  // Current state
  codebaseFiles: { path: string; content: string }[]
  instructionsContext: string

  // AI responses
  clarifyAIResponse: string
  thinkAIResponse: string
  planAIResponse: string
  actAIResponse: string
  parsedActResponse: AIParsedActResponse | null

  // Add this new property
  updateStepStatus: (status: StepStatus) => void
}
