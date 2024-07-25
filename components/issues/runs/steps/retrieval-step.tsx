import { FC } from "react"
import { StepLoader } from "./step-loader"

interface RetrievalStepProps {}

export const RetrievalStep: FC<RetrievalStepProps> = ({}) => {
  return <StepLoader text="Retrieving context..." />
}
