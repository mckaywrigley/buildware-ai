import { cn } from "@/lib/utils"
import { RunStepName, RunStepStatus, RunStepStatuses } from "@/types/run"
import {
  AlertTriangle,
  Check,
  ChevronsLeftRight,
  CircleDot,
  CirclePlus,
  Cpu,
  DiamondPlus,
  List,
  ListChecks,
  Loader2
} from "lucide-react"

const messages = [
  { text: "Started", icon: <CircleDot className="size-4" />, step: "started" },
  { text: "Embedding", icon: <Cpu className="size-4" />, step: "embedding" },
  {
    text: "Retrieval",
    icon: <CirclePlus className="size-4" />,
    step: "retrieval"
  },
  {
    text: "Specification",
    icon: <List className="size-4" />,
    step: "specification"
  },
  { text: "Plan", icon: <ListChecks className="size-4" />, step: "plan" },
  {
    text: "Implementation",
    icon: <ChevronsLeftRight className="size-4" />,
    step: "implementation"
  },
  { text: "PR", icon: <DiamondPlus className="size-4" />, step: "pr" },
  { text: "Completed", icon: <Check className="size-4" />, step: "completed" }
]

interface RunStepStatusListProps {
  currentStep: RunStepName | null
  waitingForConfirmation: boolean
  stepStatuses: RunStepStatuses
  onStepClick?: (step: RunStepName) => void
}

const getGradientClass = (
  currentStatus: RunStepStatus | null,
  nextStatus: RunStepStatus | null
) => {
  if (currentStatus === "completed") {
    if (nextStatus === "in_progress") {
      return "bg-gradient-to-b from-green-500 to-yellow-600"
    } else if (nextStatus === "completed") {
      return "bg-gradient-to-b from-green-500 to-green-600"
    } else {
      return "bg-gradient-to-b from-green-500 to-zinc-700"
    }
  }
  return "bg-zinc-700"
}

export const RunStepStatusList = ({
  currentStep,
  waitingForConfirmation,
  stepStatuses,
  onStepClick
}: RunStepStatusListProps) => {
  const getStepStatus = (step: RunStepName): RunStepStatus => {
    if (waitingForConfirmation && step === currentStep) {
      return "in_progress"
    }

    return stepStatuses[step] ?? "waiting"
  }

  return (
    <div className="col-span-1 p-6">
      <div className="bg-secondary rounded-lg p-4">
        {messages.map(({ text, icon, step }, index) => {
          const status = getStepStatus(step as RunStepName)
          const nextStatus =
            index < messages.length - 1
              ? getStepStatus(messages[index + 1].step as RunStepName)
              : null
          const isCurrentStep = step === currentStep

          return (
            <div key={index} className="relative">
              <div className="flex items-center justify-between py-2">
                <div
                  className={cn(
                    "flex items-center",
                    (status === "completed" || status === "in_progress") &&
                      "cursor-pointer hover:underline"
                  )}
                  onClick={() =>
                    (status === "completed" || status === "in_progress") &&
                    onStepClick?.(step as RunStepName)
                  }
                >
                  <div
                    className={`relative z-10 mr-4 rounded-full p-1 text-white ${
                      status === "in_progress"
                        ? "bg-yellow-600"
                        : status === "completed"
                          ? "bg-green-600"
                          : "bg-zinc-600"
                    }`}
                  >
                    {status === "in_progress" ? (
                      waitingForConfirmation && step === currentStep ? (
                        <AlertTriangle className="size-4 text-yellow-300" />
                      ) : (
                        <Loader2 className="size-4 animate-spin" />
                      )
                    ) : (
                      icon
                    )}
                  </div>

                  <div
                    className={cn(
                      isCurrentStep && "font-extrabold",
                      isCurrentStep &&
                        !waitingForConfirmation &&
                        "animate-pulse"
                    )}
                  >
                    {text}
                  </div>
                </div>
              </div>

              {index < messages.length - 1 && (
                <>
                  <div
                    className={cn(
                      "-z-11 absolute left-[0.70rem] top-7 h-[calc(100%+0.5rem)] w-[2px]",
                      getGradientClass(status, nextStatus),
                      status === "completed" && "animate-line-grow"
                    )}
                  />

                  <div className="pl-8">
                    <div className="my-2 border-t border-zinc-700" />
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
