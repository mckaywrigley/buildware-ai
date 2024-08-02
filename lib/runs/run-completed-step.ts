import { RunStepParams } from "@/types/run"

export const runCompletedStep = async ({}: RunStepParams) => {
  try {
  } catch (error) {
    console.error("Error running completed step:", error)
    throw error
  }
}
