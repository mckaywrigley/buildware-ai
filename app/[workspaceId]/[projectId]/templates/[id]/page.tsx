import { Template } from "@/components/templates/template"
import { NotFound } from "@/components/utility/not-found"
import { getTemplateWithInstructionById } from "@/db/queries/templates-queries"

export const revalidate = 0

export default async function TemplatePage({
  params
}: {
  params: { id: string; projectId: string }
}) {
  const template = await getTemplateWithInstructionById(params.id)

  if (!template) {
    return <NotFound message="Template not found" />
  }

  return <Template template={template} />
}
