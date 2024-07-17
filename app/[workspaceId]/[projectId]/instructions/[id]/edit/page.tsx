import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import EditInstructionForm from "@/components/instructions/edit-instruction-form"
import { NotFound } from "@/components/utility/not-found"
import { getInstructionById } from "@/db/queries/instructions-queries"

export const revalidate = 0

export default async function EditInstructionPage({
  params
}: {
  params: { id: string }
}) {
  const instruction = await getInstructionById(params.id)

  if (!instruction) {
    return <NotFound message="Instruction not found" />
  }

  return (
    <CRUDPage
      pageTitle="Edit instruction"
      backText="Back to instructions"
      backLink=".."
    >
      <EditInstructionForm instruction={instruction} />
    </CRUDPage>
  )
}
