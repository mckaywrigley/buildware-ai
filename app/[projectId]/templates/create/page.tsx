import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import NewTemplateForm from "@/components/templates/new-template-form"

export const revalidate = 0

export default async function CreateTemplatePage() {
  return (
    <CRUDPage
      pageTitle="New template"
      backText="Back to templates"
      backLink="../templates"
    >
      <NewTemplateForm />
    </CRUDPage>
  )
}
