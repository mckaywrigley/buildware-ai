import { generatePR } from "@/actions/github/generate-pr"
import { SelectIssue, SelectProject } from "@/db/schema"
import { ParsedImplementation } from "@/types/run"

export const runPRStep = async ({
  issue,
  project,
  parsedImplementation
}: {
  issue: SelectIssue
  project: SelectProject
  parsedImplementation: ParsedImplementation
}) => {
  try {
    const { prLink } = await generatePR(
      issue.name,
      project,
      parsedImplementation
    )

    return {
      prLink: prLink || ""
    }
  } catch (error) {
    console.error("Error running PR step:", error)
    throw error
  }
}
