import { Loader } from "lucide-react"
import { FC } from "react"

interface StepLoaderProps {
  text: string
}

export const StepLoader: FC<StepLoaderProps> = ({ text }) => {
  return (
    <div className="flex animate-pulse items-center gap-2">
      <Loader className="size-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}
