import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import NewInstructionForm from "@/components/instructions/new-instruction-form"

export const revalidate = 0

export default async function CreateInstructionPage() {
  return (
    <CRUDPage
      pageTitle="New instruction"
      backText="Back to instructions"
      backLink="../instructions"
    >
      <NewInstructionForm />
    </CRUDPage>
  )
}
