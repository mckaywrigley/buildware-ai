import { FC } from "react"
import { StepLoader } from "./step-loader"

interface StartedStepProps {}

export const StartedStep: FC<StartedStepProps> = ({}) => {
  return <StepLoader text="Run starting" />
}
