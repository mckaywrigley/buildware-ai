import { CodegenThoughts } from "@/components/codegen/think/codegen-thoughts"
import {
  AIClarificationItem,
  AIFileInfo,
  AIPlanStep,
  AIThought
} from "@/types/ai"
import { FC } from "react"

interface StepContentProps {
  step:
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
  clarifications: AIClarificationItem[]
  thoughts: AIThought[]
  planSteps: AIPlanStep[]
  generatedFiles: AIFileInfo[]
}

export const StepContent: FC<StepContentProps> = ({
  step,
  clarifications,
  thoughts,
  planSteps,
  generatedFiles
}) => {
  switch (step) {
    case "started":
      return <div>Started step content</div>
    case "embedding":
      return <div>Embedding step content</div>
    case "retrieval":
      return <div>Retrieval step content</div>
    case "clarify":
      return <div>Clarification step content</div>
    case "think":
      return (
        <CodegenThoughts
          initialThoughts={thoughts}
          onUpdate={updatedThoughts => {
            console.log("Updated thoughts:", updatedThoughts)
          }}
        />
      )
    case "plan":
      return <div>Planning step content</div>
    case "act":
      return <div>Action step content</div>
    case "verify":
      return <div>Verification step content</div>
    case "pr":
      return <div>Pull request step content</div>
    case "completed":
      return <div>Completed step content</div>
    default:
      return null
  }
}
