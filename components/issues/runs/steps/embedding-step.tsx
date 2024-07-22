import { FC } from "react"
import { StepLoader } from "./step-loader"

interface EmbeddingStepProps {}

export const EmbeddingStep: FC<EmbeddingStepProps> = ({}) => {
  return <StepLoader text="Embedding branch..." />
}
