import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { cn } from "@/lib/utils"
import { RunStep } from "@/types/run"
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
  { text: "Think", icon: <List className="size-4" />, step: "think" },
  { text: "Plan", icon: <ListChecks className="size-4" />, step: "plan" },
  { text: "Act", icon: <ChevronsLeftRight className="size-4" />, step: "act" },
  { text: "PR", icon: <DiamondPlus className="size-4" />, step: "pr" },
  { text: "Completed", icon: <Check className="size-4" />, step: "completed" }
]

interface IssueMessagesProps {
  currentStep: RunStep
  waitingForConfirmation: boolean
  onStepClick?: (step: RunStep) => void
}

export const IssueMessages = ({
  currentStep,
  waitingForConfirmation,
  onStepClick
}: IssueMessagesProps) => {
  // const [hoveredStep, setHoveredStep] = useState<string | null>(null)

  const getStepStatus = (step: string) => {
    if (step === currentStep) return "current"
    const currentIndex = messages.findIndex(m => m.step === currentStep)
    const stepIndex = messages.findIndex(m => m.step === step)
    return stepIndex < currentIndex ? "completed" : "pending"
  }

  return (
    <div className="col-span-1 border-r p-6">
      <div className="bg-secondary rounded-lg p-4">
        {messages.map(({ text, icon, step }, index) => {
          const status = getStepStatus(step)
          return (
            <div
              key={index}
              className="relative"
              // onMouseEnter={() => setHoveredStep(step)}
              // onMouseLeave={() => setHoveredStep(null)}
            >
              <div className="flex items-center justify-between py-2">
                <div
                  className={cn(
                    "flex items-center",
                    (status === "completed" || status === "current") &&
                      "cursor-pointer hover:underline"
                  )}
                  onClick={() =>
                    (status === "completed" || status === "current") &&
                    onStepClick?.(step as RunStep)
                  }
                >
                  <div
                    className={`relative z-10 mr-4 rounded-full p-1 ${
                      status === "current"
                        ? "bg-yellow-600"
                        : status === "completed"
                          ? "bg-green-600"
                          : "bg-zinc-600"
                    }`}
                  >
                    {status === "current" ? (
                      waitingForConfirmation ? (
                        <AlertTriangle className="size-4 text-yellow-300" />
                      ) : (
                        <Loader2 className="size-4 animate-spin" />
                      )
                    ) : (
                      icon
                    )}
                  </div>
                  <MessageMarkdown content={text} />
                </div>

                {/* <RunStepStatus isHovered={hoveredStep === step} /> */}
              </div>

              {index < messages.length - 1 && (
                <>
                  <div
                    className={cn(
                      "-z-11 absolute left-[0.70rem] top-7 h-[calc(100%+0.5rem)] w-[2px]",
                      status === "completed"
                        ? "animate-line-grow bg-gradient-to-b from-[var(--run-line-gradient-color-one)] via-[var(--run-line-gradient-color-two)] to-[var(--run-line-gradient-color-three)]"
                        : "bg-zinc-700"
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
