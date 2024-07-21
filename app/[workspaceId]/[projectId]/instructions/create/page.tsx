import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { CreateInstruction } from "@/components/instructions/create-instruction"

export const revalidate = 0

export default async function CreateInstructionPage() {
  return (
    <CRUDPage
      pageTitle="New instruction"
      backText="Back to instructions"
      backLink="../instructions"
    >
      <CreateInstruction />
    </CRUDPage>
  )
}
