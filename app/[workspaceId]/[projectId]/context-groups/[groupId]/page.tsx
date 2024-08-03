import { ContextGroupDetail } from "@/components/context-groups/ContextGroupDetail"
import { NotFound } from "@/components/utility/not-found"
import { getContextGroup } from "@/actions/context-groups"

export const revalidate = 0

export default async function ContextGroupDetailPage({
  params
}: {
  params: { groupId: string }
}) {
  const contextGroup = await getContextGroup(params.groupId)

  if (!contextGroup) {
    return <NotFound message="Context group not found" />
  }

  return (
    <div className="container mx-auto py-8">
      <ContextGroupDetail groupId={params.groupId} />
    </div>
  )
}