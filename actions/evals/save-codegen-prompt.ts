"use server"

import { promises as fs } from "fs"
import path from "path"

export async function savePrompt(
  prompt: string,
  issueName: string,
  step: "think" | "plan" | "code",
  type: "prompt" | "response"
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileName = `${step}-${type}-${timestamp}.md`
  const dirPath = path.join(process.cwd(), "buildware-evals", issueName)
  const filePath = path.join(dirPath, fileName)

  try {
    await fs.mkdir(dirPath, { recursive: true })
    await fs.writeFile(filePath, prompt)
    console.log(`Prompt saved to ${filePath}`)
  } catch (error) {
    console.error("Error saving prompt:", error)
  }
}
