"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateWorkspace } from "@/db/queries/workspace-queries"
import { SelectWorkspace } from "@/db/schema"

interface EditWorkspaceClientProps {
  workspace: SelectWorkspace | null
  workspaceId: string
}

export function EditWorkspaceClient({
  workspace,
  workspaceId
}: EditWorkspaceClientProps) {
  const [name, setName] = useState(workspace?.name || "")
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
      </div>
    </div>
  )
}
