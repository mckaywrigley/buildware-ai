import { FC } from "react"
import { StepLoader } from "./step-loader"

interface PRStepProps {}

export const PRStep: FC<PRStepProps> = ({}) => {
  return <StepLoader text="Creating PR..." />
}
