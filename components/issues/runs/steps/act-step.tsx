import { FC } from "react"
import { StepLoader } from "./step-loader"

interface ActStepProps {}

export const ActStep: FC<ActStepProps> = ({}) => {
  return <StepLoader text="Generating code..." />
}
