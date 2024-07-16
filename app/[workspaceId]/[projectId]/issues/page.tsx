import { IssuesList } from "@/components/issues/issues-list"
import { getIssuesByProjectId } from "@/db/queries/issue-queries"

export const revalidate = 0

export default async function IssuesPage({
  params
}: {
  params: { projectId: string }
}) {
  const issues = await getIssuesByProjectId(params.projectId)

  return <IssuesList issues={issues} projectId={params.projectId} />
}
