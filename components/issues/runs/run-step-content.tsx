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
  parsedSpecification: ParsedSpecification
  setParsedSpecification: (specification: ParsedSpecification) => void
  parsedPlan: ParsedPlan
  setParsedPlan: (plan: ParsedPlan) => void
  prLink: string
  parsedImplementation: ParsedImplementation
  setParsedImplementation: (implementation: ParsedImplementation) => void
}

export const RunStepContent = ({
  stepName,
  parsedSpecification,
  setParsedSpecification,
  parsedPlan,
  setParsedPlan,
  prLink,
  parsedImplementation,
  setParsedImplementation
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
          parsedSpecification={parsedSpecification}
          onUpdateParsedSpecification={setParsedSpecification}
        />
      )
    case "plan":
      return (
        <PlanStep parsedPlan={parsedPlan} onUpdateParsedPlan={setParsedPlan} />
      )
    case "implementation":
      return (
        <ImplementationStep
          parsedImplementation={parsedImplementation}
          onUpdateParsedImplementation={setParsedImplementation}
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
