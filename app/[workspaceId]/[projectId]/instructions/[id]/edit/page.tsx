import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { EditInstruction } from "@/components/instructions/edit-instruction"
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
      <EditInstruction instruction={instruction} />
    </CRUDPage>
  )
}
