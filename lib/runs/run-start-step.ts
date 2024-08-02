import { RunStepParams } from "@/types/run"

export const runStartStep = async ({}: RunStepParams) => {
  try {
  } catch (error) {
    console.error("Error running start step:", error)
    throw error
  }
}
