import { FoldVertical, MessageSquare, RefreshCcw, Trash2 } from "lucide-react"

interface RunStepStatusProps {
  isHovered: boolean
}

export const RunStepStatus = ({ isHovered }: RunStepStatusProps) => {
  if (!isHovered) return null

  return (
    <div className="flex items-center space-x-1">
      <StatusIcon icon={MessageSquare} />
      <StatusIcon icon={RefreshCcw} />
      <StatusIcon icon={Trash2} />
      <StatusIcon icon={FoldVertical} />
    </div>
  )
}

interface StatusIconProps {
  icon: React.ElementType
}

const StatusIcon = ({ icon: Icon }: StatusIconProps) => (
  <div className="rounded-full p-1 hover:bg-zinc-800">
    <Icon className="size-4 cursor-pointer" />
  </div>
)
