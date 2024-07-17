import { InstructionsList } from "@/components/instructions/instruction-list"
import { getInstructionsByProjectId } from "@/db/queries/instructions-queries"

export const revalidate = 0

export default async function InstructionPage({
  params
}: {
  params: { projectId: string }
}) {
  const instructions = await getInstructionsByProjectId(params.projectId)

  return <InstructionsList instructions={instructions} />
}
