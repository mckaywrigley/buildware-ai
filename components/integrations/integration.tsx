import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { FC, HTMLAttributes, ReactNode } from "react"
import { Button } from "../ui/button"

interface IntegrationProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  icon: ReactNode
  isConnecting: boolean
  isConnected: boolean
  disabled: boolean
  onClick: () => void
}

export const Integration: FC<IntegrationProps> = ({
  name,
  icon,
  isConnecting,
  isConnected,
  disabled,
  onClick,
  ...props
}) => {
  return (
    <div
      className={cn(
        "border-primary/20 bg-secondary flex items-center justify-between rounded border p-4",
        props.className
      )}
    >
      <div className="flex items-center gap-2">
        <div>{icon}</div>
        <div className="font-bold">{name}</div>
      </div>

      <Button className="w-[120px]" onClick={onClick} disabled={disabled}>
        {isConnecting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isConnected ? (
          "Connected"
        ) : (
          "Connect"
        )}
      </Button>
    </div>
  )
}
