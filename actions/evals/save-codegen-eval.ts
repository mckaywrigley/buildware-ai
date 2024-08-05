"use server"

import { RunStepName } from "@/types/run"
import { promises as fs } from "fs"
import path from "path"

export async function saveCodegenEval(
  prompt: string,
  issueName: string,
  step: RunStepName,
  type: "prompt" | "response"
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileName = `${timestamp}-${step}-${type}.md`
  const dirPath = path.join(process.cwd(), "buildware-evals", issueName)
  const filePath = path.join(dirPath, fileName)

  try {
    await fs.mkdir(dirPath, { recursive: true })
    await fs.writeFile(filePath, prompt)
    console.warn(`Prompt saved to ${filePath}`)
  } catch (error) {
    console.error("Error saving prompt:", error)
  }
}
