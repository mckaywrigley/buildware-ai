import { IssuesList } from "@/components/issues/issues-list"
import { getIssuesByProjectId } from "@/db/queries/issue-queries"
import { auth } from "@clerk/nextjs/server"

export default async function IssuesPage({
  params
}: {
  params: { projectId: string }
}) {
  const { userId } = auth()

  if (!userId) {
    throw new Error("User not found")
  }

  const issues = await getIssuesByProjectId(params.projectId)

  return <IssuesList issues={issues} projectId={params.projectId} />
}
