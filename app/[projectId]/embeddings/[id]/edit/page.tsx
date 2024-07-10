import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { NotFound } from "@/components/utility/not-found"
import { getEmbeddedBranchById } from "@/db/queries/embedded-branch-queries"

export const revalidate = 0

export default async function EditEmbeddedBranchPage({
  params
}: {
  params: { id: string }
}) {
  const embeddedBranch = await getEmbeddedBranchById(params.id)

  if (!embeddedBranch) {
    return <NotFound message="Embedded branch not found" />
  }

  return (
    <CRUDPage
      pageTitle="Edit embedded branch"
      backText="Back to embedded branches"
      backLink=".."
    >
      {/* <EditEmbeddedBranchForm embeddedBranch={embeddedBranch} /> */}
      <div>{embeddedBranch.branchName}</div>
    </CRUDPage>
  )
}
