import { Instruction } from "@/components/instructions/instruction"
import { NotFound } from "@/components/utility/not-found"
import { getInstructionById } from "@/db/queries/instructions-queries"

export const revalidate = 0

export default async function InstructionPage({
  params
}: {
  params: { id: string; projectId: string }
}) {
  const instruction = await getInstructionById(params.id)

  if (!instruction) {
    return <NotFound message="Instruction not found" />
  }

  return <Instruction instruction={instruction} />
}
