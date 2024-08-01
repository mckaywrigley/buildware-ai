import { ContextGroupList } from "@/components/context-groups/context-group-list"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { getContextGroupsByProjectId } from "@/db/queries/context-groups-queries"

export const revalidate = 0

export default async function ContextPage({
  params
}: {
  params: { projectId: string; workspaceId: string }
}) {
  const contextGroups = await getContextGroupsByProjectId(params.projectId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Context Groups</h1>
          <p className="text-muted-foreground mt-1">
            Manage your project's context groups
          </p>
        </div>
        <Link href={`./context/create`}>
          <Button>
            <PlusIcon className="mr-2 size-4" />
            Create Context
          </Button>
        </Link>
      </div>
      <ContextGroupList contextGroups={contextGroups} />
    </div>
  )
}
