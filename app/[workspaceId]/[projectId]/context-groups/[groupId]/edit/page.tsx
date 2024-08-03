import { ContextGroupForm } from "@/components/context-groups/ContextGroupForm"
import { NotFound } from "@/components/utility/not-found"
import { getContextGroup } from "@/actions/context-groups"

export const revalidate = 0

export default async function EditContextGroupPage({
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
      <h1 className="mb-6 text-2xl font-bold">Edit Context Group</h1>
      <ContextGroupForm contextGroup={contextGroup} isEditing={true} />
    </div>
  )
}