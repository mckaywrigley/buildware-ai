import { SelectInstruction } from "@/db/schema"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { Eye } from "lucide-react"
import { FC, useState } from "react"
import { MessageMarkdown } from "../instructions/message-markdown"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"

interface IssueContextProps {
  name: string
  content: string
  selectedInstructions: SelectInstruction[]
}

export const IssueContext: FC<IssueContextProps> = ({
  name,
  content,
  selectedInstructions
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Eye className="mr-2 size-4" />
          View Context
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-[800px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{name || "No issue name"}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <MessageMarkdown content={content || "No issue content"} />
        </div>
        <div className="mt-6">
          {selectedInstructions.length > 0 ? (
            selectedInstructions.map(instruction => (
              <div key={instruction.id} className="mt-2">
                {instruction.content && (
                  <MessageMarkdown content={instruction.content} />
                )}
              </div>
            ))
          ) : (
            <div>No instructions.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
