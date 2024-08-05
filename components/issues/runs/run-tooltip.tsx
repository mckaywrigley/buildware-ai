import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface RunTooltipProps {
  issueName: string
  issueContent: string
}

export const RunTooltip = ({ issueName, issueContent }: RunTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Info className="size-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{issueName}</DialogTitle>
            </DialogHeader>
            <MessageMarkdown content={issueContent} />
          </DialogContent>
        </Dialog>

        <TooltipContent>
          <div>View your issue</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
