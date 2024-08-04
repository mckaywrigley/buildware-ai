import { SelectContextGroup, SelectInstruction } from "@/db/schema"
import { ChevronDown, ChevronRight, Eye, File, Folder } from "lucide-react"
import { useState } from "react"
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
import { Separator } from "../ui/separator"

interface ViewIssueContextProps {
  name: string
  content: string
  selectedInstructions: SelectInstruction[]
  attachedContextGroups: {
    contextGroupId: string
    issueId: string
    contextGroup: SelectContextGroup & {
      files: {
        id: string
        path: string
        type: "file" | "folder"
      }[]
    }
  }[]
}

export const ViewIssueContext = ({
  name,
  content,
  selectedInstructions,
  attachedContextGroups
}: ViewIssueContextProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button onClick={() => setIsOpen(true)}>
          <Eye className="mr-2 size-4" />
          View Context
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-[800px] overflow-y-auto pb-20">
        <DialogHeader className="border-primary/50 border-b pb-4">
          <DialogTitle>Issue Context</DialogTitle>

          <DialogDescription>
            View the issue and instructions that will be passed into the system.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          <div className="text-xl font-bold">{name || "No issue name"}</div>

          <MessageMarkdown content={content || "No issue content"} />
        </div>

        <Separator className="my-4" />

        <div>
          {selectedInstructions.length > 0 ? (
            selectedInstructions.map(instruction => (
              <div key={instruction.id} className="mt-2 flex flex-col gap-2">
                <div className="text-xl font-bold">{instruction.name}</div>

                {instruction.content && (
                  <MessageMarkdown content={instruction.content} />
                )}
              </div>
            ))
          ) : (
            <div>No instructions.</div>
          )}
        </div>

        <div className="mt-4">
          <div className="text-xl font-bold">Attached Context Groups</div>

          {attachedContextGroups.length > 0 ? (
            attachedContextGroups.map(group => (
              <div key={group.contextGroupId} className="mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 text-left"
                  onClick={() => toggleGroup(group.contextGroupId)}
                >
                  {expandedGroups.includes(group.contextGroupId) ? (
                    <ChevronDown className="mr-2 size-4" />
                  ) : (
                    <ChevronRight className="mr-2 size-4" />
                  )}
                  <span className="text-lg font-semibold">
                    {group.contextGroup.name}
                  </span>
                </Button>

                {expandedGroups.includes(group.contextGroupId) && (
                  <div className="ml-6 mt-2">
                    {group.contextGroup.files?.map(file => (
                      <div key={file.id} className="flex items-center py-1">
                        {file.type === "file" ? (
                          <File className="mr-2 size-4" />
                        ) : (
                          <Folder className="mr-2 size-4" />
                        )}
                        <span>{file.path}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="mt-2">No context groups attached.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
