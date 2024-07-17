"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createWorkspace } from "@/db/queries/workspaces-queries"
import { cn } from "@/lib/utils"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, HTMLAttributes, useState } from "react"

interface CreateWorkspaceButtonProps extends HTMLAttributes<HTMLDivElement> {}

export const CreateWorkspaceButton: FC<CreateWorkspaceButtonProps> = ({
  ...props
}) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")

  const handleCreateWorkspace = async () => {
    try {
      const workspace = await createWorkspace({
        name: workspaceName || "My Workspace"
      })
      router.push(`/${workspace.id}`)
      setOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={cn("", props.className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <PlusIcon className="mr-2 size-4" />
            Workspace
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter a name for your workspace..."
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleCreateWorkspace}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
