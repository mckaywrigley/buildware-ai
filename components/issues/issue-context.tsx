import { SelectInstruction } from "@/db/schema"
import { Eye } from "lucide-react"
import { FC, useState } from "react"
import { MessageMarkdown } from "../instructions/message-markdown"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"

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

      <DialogContent className="max-h-[90vh] max-w-[800px] overflow-y-auto pb-20">
        <DialogHeader className="border-primary/50 border-b pb-4">
          <DialogTitle>Issue Context</DialogTitle>
          <DialogDescription>
            View the issue's name, content, and associated instructions that
            will be passed into the system.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          <div className="text-3xl font-bold">{name || "No issue name"}</div>
          <MessageMarkdown content={content || "No issue content"} />
        </div>

        <hr className="my-4" />

        <div>
          {selectedInstructions.length > 0 ? (
            selectedInstructions.map(instruction => (
              <div key={instruction.id} className="mt-2 flex flex-col gap-2">
                <div className="text-3xl font-bold">{instruction.name}</div>
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
