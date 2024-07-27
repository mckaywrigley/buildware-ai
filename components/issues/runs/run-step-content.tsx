import { ThinkStep } from "@/components/issues/runs/steps/think-step"
import { AIClarificationItem, AIPlanStep, AIThought } from "@/types/ai"
import { StepName } from "@/types/run"
import { ActStep } from "./steps/act-step"
import { CompletedStep } from "./steps/completed-step"
import { EmbeddingStep } from "./steps/embedding-step"
import { PlanStep } from "./steps/plan-step"
import { PRStep } from "./steps/pr-step"
import { RetrievalStep } from "./steps/retrieval-step"
import { StartedStep } from "./steps/started-step"

interface RunStepContentProps {
  step: StepName | null
  clarifications: AIClarificationItem[]
  thoughts: AIThought[]
  planSteps: AIPlanStep[]
  setClarifications: (clarifications: AIClarificationItem[]) => void
  setThoughts: (thoughts: AIThought[]) => void
  setPlanSteps: (planSteps: AIPlanStep[]) => void
}

export const RunStepContent = ({
  step,
  thoughts,
  planSteps,
  setThoughts,
  setPlanSteps
}: RunStepContentProps) => {
  switch (step) {
    case "started":
      return <StartedStep />
    case "embedding":
      return <EmbeddingStep />
    case "retrieval":
      return <RetrievalStep />
    case "think":
      return <ThinkStep thoughts={thoughts} onUpdateThoughts={setThoughts} />
    case "plan":
      return <PlanStep plans={planSteps} onUpdatePlans={setPlanSteps} />
    case "act":
      return <ActStep />
    case "pr":
      return <PRStep />
    case "completed":
      return <CompletedStep />
    default:
      return null
  }
}
