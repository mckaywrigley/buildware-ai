import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { SelectInstruction } from "@/db/schema"

interface ViewIssueInstructionProps {
  selectedInstruction: SelectInstruction | null
  onClose: () => void
}

export const ViewIssueInstruction = ({
  selectedInstruction,
  onClose
}: ViewIssueInstructionProps) => {
  return (
    <Dialog open={!!selectedInstruction} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedInstruction?.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Card>
            <CardContent className="bg-secondary/50 p-4">
              <MessageMarkdown content={selectedInstruction?.content || ""} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
