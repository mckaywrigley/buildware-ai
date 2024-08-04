import { getRun, getRunSteps } from "@/db/queries/runs-queries"
import { SelectRun, SelectRunStep } from "@/db/schema/runs-schema"

export async function loadRunData(runId: string): Promise<{
  run: SelectRun
  steps: SelectRunStep[]
} | null> {
  try {
    const run = await getRun(runId)
    if (!run) {
      throw new Error("Run not found")
    }

    const steps = await getRunSteps(runId)

    return { run, steps }
  } catch (error) {
    console.error("Error loading run data:", error)
    return null
  }
}