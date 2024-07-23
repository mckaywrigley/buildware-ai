import { ThinkStep } from "@/components/issues/runs/steps/think-step"
import { AIClarificationItem, AIPlanStep, AIThought } from "@/types/ai"
import { RunStep } from "@/types/run"
import { FC } from "react"
import { ActStep } from "./steps/act-step"
import { ClarifyStep } from "./steps/clarify-step"
import { CompletedStep } from "./steps/completed-step"
import { EmbeddingStep } from "./steps/embedding-step"
import { PlanStep } from "./steps/plan-step"
import { PRStep } from "./steps/pr-step"
import { RetrievalStep } from "./steps/retrieval-step"
import { StartedStep } from "./steps/started-step"
import { VerifyStep } from "./steps/verify-step"

interface RunStepContentProps {
  step: RunStep
  clarifications: AIClarificationItem[]
  thoughts: AIThought[]
  planSteps: AIPlanStep[]
  setClarifications: (clarifications: AIClarificationItem[]) => void
  setThoughts: (thoughts: AIThought[]) => void
  setPlanSteps: (planSteps: AIPlanStep[]) => void
  onNextStep: () => void
}

export const RunStepContent: FC<RunStepContentProps> = ({
  step,
  clarifications,
  thoughts,
  planSteps,
  setClarifications,
  setThoughts,
  setPlanSteps,
  onNextStep
}) => {
  switch (step) {
    case "started":
      return <StartedStep />
    case "embedding":
      return <EmbeddingStep />
    case "retrieval":
      return <RetrievalStep />
    case "clarify":
      return (
        <ClarifyStep
          clarifications={clarifications}
          onUpdateClarifications={setClarifications}
          onNextStep={onNextStep}
        />
      )
    case "think":
      return (
        <ThinkStep
          thoughts={thoughts}
          onUpdateThoughts={setThoughts}
          onNextStep={onNextStep}
        />
      )
    case "plan":
      return (
        <PlanStep
          plans={planSteps}
          onUpdatePlans={setPlanSteps}
          onNextStep={onNextStep}
        />
      )
    case "act":
      return <ActStep />
    case "verify":
      return <VerifyStep />
    case "pr":
      return <PRStep />
    case "completed":
      return <CompletedStep />
    default:
      return null
  }
}
