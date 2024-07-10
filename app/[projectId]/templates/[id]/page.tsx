import { Template } from "@/components/templates/template"
import { NotFound } from "@/components/utility/not-found"
import { getTemplateWithPromptById } from "@/db/queries/template-queries"

export const revalidate = 0

export default async function TemplatePage({
  params
}: {
  params: { id: string; projectId: string }
}) {
  const template = await getTemplateWithPromptById(params.id)

  if (!template) {
    return <NotFound message="Template not found" />
  }

  return <Template template={template} />
}
