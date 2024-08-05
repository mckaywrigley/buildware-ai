import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import { runStatusEnum } from "./../db/schema/runs-schema"

export type StepName =
  | "started"
  | "embedding"
  | "retrieval"
  | "specification"
  | "plan"
  | "implementation"
  | "pr"
  | "completed"

export type RunStepStatuses = {
  [key in StepName]: typeof runStatusEnum.enumValues
}

export interface RunStepParams {
  codebaseFiles: { path: string; content: string }[]
  issue: SelectIssue
  instructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
  instructionsContext: string
  parsedPlan: ParsedPlan
  planResponse: string
  parsedSpecification: ParsedSpecification
  specificationResponse: string
  parsedImplementation: ParsedImplementation
  implementationResponse: string
  project: SelectProject
  stepStatuses: RunStepStatuses
  setParsedImplementation: (implementation: ParsedImplementation) => void
  setImplementationResponse: (implementation: string) => void
  setParsedPlan: (plan: ParsedPlan) => void
  setPlanResponse: (plan: string) => void
  setParsedSpecification: (specification: ParsedSpecification) => void
  setSpecificationResponse: (specification: string) => void
  setStepStatuses: React.Dispatch<React.SetStateAction<RunStepStatuses>>
  setPrLink: (prLink: string) => void
}

export interface GeneratedFile {
  status: "new" | "modified" | "deleted"
  path: string
  content: string
}

export interface ParsedSpecification {
  steps: SpecificationStep[]
}

export interface SpecificationStep {
  text: string
}

export interface ParsedPlan {
  steps: PlanStep[]
}

export interface PlanStep {
  text: string
}

export interface ParsedImplementation {
  files: GeneratedFile[]
  prTitle: string
  prDescription: string
}
