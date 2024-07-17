"use client"

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
import { deleteProject } from "@/db/queries/projects-queries"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { HTMLAttributes, useState } from "react"
import { toast } from "sonner"

interface DeleteProjectButtonProps extends HTMLAttributes<HTMLButtonElement> {
  projectId: string
  workspaceId: string
}

export function DeleteProjectButton({
  projectId,
  workspaceId,
  ...props
}: DeleteProjectButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteProject = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(projectId)
      toast.success("Project deleted successfully")
      router.push(`/${workspaceId}`)
    } catch (error) {
      console.error("Failed to delete project:", error)
      toast.error("Failed to delete project. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger className={cn(props.className)} asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 size-4" />
          Delete Project
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this project?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            project and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteProject}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
