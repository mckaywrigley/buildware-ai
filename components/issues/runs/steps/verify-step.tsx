import { FC } from "react"
import { StepLoader } from "./step-loader"

interface VerifyStepProps {}

export const VerifyStep: FC<VerifyStepProps> = ({}) => {
  return <StepLoader text="Verifying..." />
}
