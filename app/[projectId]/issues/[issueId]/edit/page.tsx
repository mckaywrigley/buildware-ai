import { EditIssueForm } from "@/components/issues/edit-issue-form"
import { getIssueById } from "@/db/queries/issue-queries"
import { auth } from "@clerk/nextjs/server"

export const revalidate = 0

export default async function EditIssuePage({
  params
}: {
  params: { issueId: string }
}) {
  const { userId } = auth()

  if (!userId) {
    return <div>Unauthorized</div>
  }

  const issue = await getIssueById(params.issueId)

  if (!issue) {
    return <div>Issue not found</div>
  }

  return <EditIssueForm issue={issue} />
}
