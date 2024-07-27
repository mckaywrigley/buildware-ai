import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import {
  AIClarificationItem,
  AIFileInfo,
  AIParsedActResponse,
  AIPlanStep,
  AIThought
} from "@/types/ai"

export type RunStep =
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

export interface RunStepParams {
  issue: SelectIssue
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
  setCurrentStep: (step: RunStep) => void
  setClarifications: (clarifications: AIClarificationItem[]) => void
  setThoughts: (thoughts: AIThought[]) => void
  setPlanSteps: (planSteps: AIPlanStep[]) => void
  setGeneratedFiles: (files: AIFileInfo[]) => void
  codebaseFiles: { path: string; content: string }[]
  instructionsContext: string
  clarifyAIResponse: string
  thinkAIResponse: string
  planAIResponse: string
  actAIResponse: string
  parsedActResponse: AIParsedActResponse | null
  setCodebaseFiles: React.Dispatch<
    React.SetStateAction<{ path: string; content: string }[]>
  >
  setInstructionsContext: React.Dispatch<React.SetStateAction<string>>
  setAIResponses: (
    type: "clarify" | "think" | "plan" | "act",
    response: string
  ) => void
}
