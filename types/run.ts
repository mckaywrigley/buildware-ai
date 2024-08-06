import {
  runStepNameEnum,
  runStepStatusEnum,
  SelectInstruction,
  SelectIssue,
  SelectProject,
  SelectRun,
  SelectRunStep
} from "@/db/schema"

export type RunStepName = (typeof runStepNameEnum.enumValues)[number]

export type RunStepStatus = (typeof runStepStatusEnum.enumValues)[number]

export type RunStepStatuses = Record<RunStepName, RunStepStatus | null>

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

export interface Run extends SelectRun {
  steps: SelectRunStep[]
}