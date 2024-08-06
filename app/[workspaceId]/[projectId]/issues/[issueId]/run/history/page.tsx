import { RunHistory } from "@/components/issues/runs/run-history"
import { getRunsWithStepsByIssueId } from "@/db/queries/runs-queries"

export const revalidate = 0

export default async function RunHistoryPage({
  params
}: {
  params: { issueId: string }
}) {
  const runsWithSteps = await getRunsWithStepsByIssueId(params.issueId)

  if (runsWithSteps.length === 0) {
    return <div>No runs found</div>
  }

  return (
    <div>
      <RunHistory runsWithSteps={runsWithSteps} />
    </div>
  )
}