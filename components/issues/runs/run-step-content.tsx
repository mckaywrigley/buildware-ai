import {
  ParsedImplementation,
  ParsedPlan,
  ParsedSpecification,
  StepName
} from "@/types/run"
import { CompletedStep } from "./steps/completed-step"
import { EmbeddingStep } from "./steps/embedding-step"
import { ImplementationStep } from "./steps/implementation-step"
import { PlanStep } from "./steps/plan-step"
import { PRStep } from "./steps/pr-step"
import { RetrievalStep } from "./steps/retrieval-step"
import { SpecificationStep } from "./steps/specification-step"
import { StartedStep } from "./steps/started-step"

interface RunStepContentProps {
  stepName: StepName | null
  prLink: string
  specification: ParsedSpecification
  plan: ParsedPlan
  implementation: ParsedImplementation
  onUpdateSpecification: (specification: ParsedSpecification) => void
  onUpdatePlan: (plan: ParsedPlan) => void
  onUpdateImplementation: (implementation: ParsedImplementation) => void
  runId?: string
  stepId?: string
}

export const RunStepContent = ({
  stepName,
  prLink,
  specification,
  plan,
  implementation,
  onUpdateSpecification,
  onUpdatePlan,
  onUpdateImplementation,
  runId,
  stepId
}: RunStepContentProps) => {
  switch (stepName) {
    case "started":
      return <StartedStep runId={runId} stepId={stepId} />
    case "embedding":
      return <EmbeddingStep runId={runId} stepId={stepId} />
    case "retrieval":
      return <RetrievalStep runId={runId} stepId={stepId} />
    case "specification":
      return (
        <SpecificationStep
          specification={specification}
          onUpdateSpecification={onUpdateSpecification}
          runId={runId}
          stepId={stepId}
        />
      )
    case "plan":
      return <PlanStep plan={plan} onUpdatePlan={onUpdatePlan} runId={runId} stepId={stepId} />
    case "implementation":
      return (
        <ImplementationStep
          implementation={implementation}
          onUpdateImplementation={onUpdateImplementation}
          runId={runId}
          stepId={stepId}
        />
      )
    case "pr":
      return <PRStep runId={runId} stepId={stepId} />
    case "completed":
      return <CompletedStep prLink={prLink} runId={runId} stepId={stepId} />
    default:
      return null
  }
}