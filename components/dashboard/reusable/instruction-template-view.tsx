"use client"

import { MessageMarkdown } from "@/components/instructions/message-markdown"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { CRUDPage } from "./crud-page"

interface InstructionTemplateViewProps {
  item: {
    id: string
    name: string
    content: string
    projectId: string
  }
  type: "instruction" | "template"
  onDelete: (id: string) => Promise<void>
  attachedInstructions?: {
    id: string
    name: string
    content: string
  }[]
}

export const InstructionTemplateView: React.FC<
  InstructionTemplateViewProps
> = ({ item, type, onDelete, attachedInstructions = [] }) => {
  const router = useRouter()
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [selectedInstruction, setSelectedInstruction] = useState<{
    id: string
    name: string
    content: string
  } | null>(null)

  const handleDelete = async () => {
    try {
      await onDelete(item.id)
      setIsDeleteOpen(false)
      router.push(`../${type}s`)
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
    }
  }

  return (
    <CRUDPage
      pageTitle={item.name}
      backText={`Back to ${type}s`}
      backLink={`../${type}s`}
    >
      <div className="mb-4 flex justify-start gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`./${item.id}/edit`)}
        >
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {type}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this {type}? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

      <Card>
        <CardContent className="bg-secondary/50 p-4">
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
