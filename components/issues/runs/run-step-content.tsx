import {
  ParsedImplementation,
  ParsedPlan,
  ParsedSpecification,
  RunStepName
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
  stepName: RunStepName | null
  prLink: string
  specification: ParsedSpecification
  plan: ParsedPlan
  implementation: ParsedImplementation
  onUpdateSpecification: (specification: ParsedSpecification) => void
  onUpdatePlan: (plan: ParsedPlan) => void
  onUpdateImplementation: (implementation: ParsedImplementation) => void
}

export const RunStepContent = ({
  stepName,
  prLink,
  specification,
  plan,
  implementation,
  onUpdateSpecification,
  onUpdatePlan,
  onUpdateImplementation
}: RunStepContentProps) => {
  switch (stepName) {
    case "started":
      return <StartedStep />
    case "embedding":
      return <EmbeddingStep />
    case "retrieval":
      return <RetrievalStep />
    case "specification":
      return (
        <SpecificationStep
          specification={specification}
          onUpdateSpecification={onUpdateSpecification}
        />
      )
    case "plan":
      return <PlanStep plan={plan} onUpdatePlan={onUpdatePlan} />
    case "implementation":
      return (
        <ImplementationStep
          implementation={implementation}
          onUpdateImplementation={onUpdateImplementation}
        />
      )
    case "pr":
      return <PRStep />
    case "completed":
      return <CompletedStep prLink={prLink} />
    default:
      return null
  }
}
