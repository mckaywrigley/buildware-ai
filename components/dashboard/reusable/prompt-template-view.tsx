"use client"

import { MessageMarkdown } from "@/components/prompts/message-markdown"
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
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { CRUDPage } from "./crud-page"

interface PromptTemplateViewProps {
  item: {
    id: string
    title: string
    content: string
    projectId: string
  }
  type: "prompt" | "template"
  onDelete: (id: string) => Promise<void>
}

export const PromptTemplateView: React.FC<PromptTemplateViewProps> = ({
  item,
  type,
  onDelete
}) => {
  const router = useRouter()
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const handleDelete = async () => {
    try {
      await onDelete(item.id)
      setIsDeleteOpen(false)
      router.push(`/${item.projectId}/${type}s`)
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
    }
  }

  return (
    <CRUDPage
      pageTitle={item.title}
      backText={`Back to ${type}s`}
      backLink=".."
    >
      <div className="flex justify-start gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`./${item.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
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
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardContent className="p-4 bg-secondary/50">
          <MessageMarkdown content={item.content} />
        </CardContent>
      </Card>
    </CRUDPage>
  )
}
