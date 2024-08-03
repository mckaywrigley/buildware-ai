import { ContextGroupsList } from "@/components/context-groups/ContextGroupsList"

export const revalidate = 0

export default async function ContextGroupsPage() {
  return (
    <div className="container mx-auto py-8">
      <ContextGroupsList />
    </div>
  )
}