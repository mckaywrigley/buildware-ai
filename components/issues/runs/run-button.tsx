import { Button } from "@/components/ui/button"
import { Loader2, Play, RefreshCw } from "lucide-react"

interface RunButtonProps {
  isRunning: boolean
  issueStatus: string
  waitingForConfirmation: boolean
  onRun: () => void
  onConfirm: () => void
}

export const RunButton = ({
  isRunning,
  issueStatus,
  waitingForConfirmation,
  onRun,
  onConfirm
}: RunButtonProps) => {
  if (waitingForConfirmation) {
    return (
      <Button variant="create" onClick={onConfirm} className="ml-4">
        <Play className="mr-2 size-4" />
        Confirm and Continue
      </Button>
    )
  }

  return (
    <Button
      variant="create"
      onClick={onRun}
      disabled={isRunning}
      className="ml-4"
    >
      {isRunning ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Running
        </>
      ) : issueStatus === "completed" ? (
        <>
          <RefreshCw className="mr-2 size-4" />
          Redo Run
        </>
      ) : (
        <>
          <Play className="mr-2 size-4" />
          Begin Run
        </>
      )}
    </Button>
  )
}
