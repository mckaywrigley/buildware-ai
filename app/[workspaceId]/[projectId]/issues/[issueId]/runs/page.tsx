import { RunHistoryList } from "@/components/issues/runs/run-history-list"
import { getRunsByIssueId } from "@/db/queries/runs-queries"
import { getIssueById } from "@/db/queries/issues-queries"
import { NotFound } from "@/components/utility/not-found"

export const revalidate = 0

export default async function RunHistoryPage({
  params
}: {
  params: { issueId: string }
}) {
  const issue = await getIssueById(params.issueId)

  if (!issue) {
    return <NotFound message="Issue not found" />
  }

  const runs = await getRunsByIssueId(params.issueId)

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Run History for {issue.name}</h1>
      <RunHistoryList runs={runs} issueId={params.issueId} />
    </div>
  )
}