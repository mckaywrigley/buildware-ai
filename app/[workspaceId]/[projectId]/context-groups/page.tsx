import { ContextGroupList } from "@/components/context-groups/context-group-list"

export default function ContextGroupsPage({ params }: { params: { projectId: string } }) {
  return <ContextGroupList projectId={params.projectId} />
}