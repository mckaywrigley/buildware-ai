"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deleteWorkspace,
  updateWorkspace
} from "@/db/queries/workspaces-queries"
import { SelectWorkspace } from "@/db/schema"
import { useRouter } from "next/navigation"
import { useState } from "react"
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

interface EditWorkspaceClientProps {
  workspace: SelectWorkspace | null
  workspaceId: string
}

export function EditWorkspaceClient({
  workspace,
  workspaceId
}: EditWorkspaceClientProps) {
  const [name, setName] = useState(workspace?.name || "")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateWorkspace(workspaceId, { name })
      router.refresh()
      router.push(`/${workspaceId}`)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteWorkspace(workspaceId)
      router.refresh()
      router.push("/workspaces")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-secondary/50 w-full max-w-md rounded border p-8">
        <div className="mb-6 text-2xl font-bold">Edit Workspace</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="mb-1 font-semibold">Workspace Name</div>
            <Input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter workspace name"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
        <div className="mt-6">
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your workspace and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
