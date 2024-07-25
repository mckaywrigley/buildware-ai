"use client"

import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, useState } from "react"
import { CRUDPage } from "./crud-page"

interface InstructionAndTemplateViewProps {
  item: {
    id: string
    name: string
    content: string
    projectId: string
  }
  type: "instruction" | "template"
  attachedInstructions?: {
    id: string
    name: string
    content: string
  }[]
}

export const InstructionAndTemplateView: FC<
  InstructionAndTemplateViewProps
> = ({ item, type, attachedInstructions = [] }) => {
  const router = useRouter()
  const [selectedInstruction, setSelectedInstruction] = useState<{
    id: string
    name: string
    content: string
  } | null>(null)

  return (
    <CRUDPage
      pageTitle={`View ${type}`}
      backText={`Back to ${type}s`}
      backLink={`../${type}s`}
    >
      <div className="mb-4 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`./${item.id}/edit`)}
        >
          <Pencil className="mr-2 size-4" />
          Edit {type}
        </Button>
      </div>

      {attachedInstructions.length > 0 && (
        <div className="my-6">
          <div className="mb-2 text-lg font-semibold">
            Attached Instructions
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedInstructions.map(instruction => (
              <Button
                key={instruction.id}
                variant="outline"
                size="sm"
                onClick={() => setSelectedInstruction(instruction)}
              >
                {instruction.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-secondary/50 flex flex-col gap-2 p-4">
        <CardTitle>{item.name}</CardTitle>

        <CardContent className="p-0">
          <MessageMarkdown content={item.content} />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedInstruction}
        onOpenChange={() => setSelectedInstruction(null)}
      >
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
    </CRUDPage>
  )
}
