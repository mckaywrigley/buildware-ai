import { ContextGroupDetail } from "@/components/context-groups/context-group-detail"

export default function ContextGroupDetailPage({ params }: { params: { contextGroupId: string } }) {
  return <ContextGroupDetail contextGroupId={params.contextGroupId} />
}