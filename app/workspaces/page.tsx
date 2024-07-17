import { Button } from "@/components/ui/button"
import { createProject } from "@/db/queries/projects-queries"
import {
  createWorkspace,
  getWorkspacesByUserId
} from "@/db/queries/workspaces-queries"
import Link from "next/link"
import { redirect } from "next/navigation"

export const revalidate = 0

export default async function WorkspacesPage() {
  const workspaces = await getWorkspacesByUserId()

  const handleCreateWorkspace = async () => {
    "use server"
    const workspace = await createWorkspace({ name: "My Workspace" })
    await createProject({
      name: "My Project",
      workspaceId: workspace.id
    })
    return redirect(`/${workspace.id}`)
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <div>No workspaces</div>
          <form action={handleCreateWorkspace}>
            <Button type="submit">Create a new workspace</Button>
          </form>
        </div>
      ) : (
        <div className="flex w-full max-w-[300px] flex-col items-center justify-center gap-4">
          <div className="text-2xl font-bold">Select a workspace.</div>
          {workspaces.map(workspace => (
            <Link
              key={workspace.id}
              href={`/${workspace.id}`}
              className="bg-secondary border-primary/20 group relative flex w-full items-center gap-2 rounded border p-4 hover:opacity-80"
            >
              <div>{workspace.name}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
