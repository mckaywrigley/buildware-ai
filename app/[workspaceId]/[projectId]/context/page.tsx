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
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-6 text-3xl font-bold">Context Groups</div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">
            Manage your project's context groups
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
    </div>
  )
}
