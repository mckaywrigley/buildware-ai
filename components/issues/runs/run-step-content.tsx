import { ThinkStep } from "@/components/issues/runs/steps/think-step"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
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
  generatedFiles: AIFileInfo[]
  setClarifications: (clarifications: AIClarificationItem[]) => void
  setThoughts: (thoughts: AIThought[]) => void
  setPlanSteps: (planSteps: AIPlanStep[]) => void
  setGeneratedFiles: (generatedFiles: AIFileInfo[]) => void
}

export const RunStepContent: FC<RunStepContentProps> = ({
  step,
  clarifications,
  thoughts,
  planSteps,
  generatedFiles,
  setClarifications,
  setThoughts,
  setPlanSteps,
  setGeneratedFiles
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
        />
      )
    case "think":
      return <ThinkStep thoughts={thoughts} onUpdateThoughts={setThoughts} />
    case "plan":
      return <PlanStep plans={planSteps} onUpdatePlans={setPlanSteps} />
    case "act":
      return (
        <ActStep files={generatedFiles} onUpdateFiles={setGeneratedFiles} />
      )
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
