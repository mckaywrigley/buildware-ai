import { AIParsedResponse } from "@/lib/types/ai/ai-issue-response"
import fs from "fs/promises"
import path from "path"

export async function makeLocalChanges(parsedResponse: AIParsedResponse) {
  const projectRoot = process.env.LOCAL_PROJECT_ROOT

  if (!projectRoot) {
    throw new Error("LOCAL_PROJECT_ROOT is required for local mode")
  }

  for (const file of parsedResponse.files) {
    const filePath = path.join(projectRoot, file.path)

    if (file.status === "new" || file.status === "modified") {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, file.content, "utf8")
    } else if (file.status === "deleted") {
      await fs.unlink(filePath)
    }
  }

  console.log("Local changes applied successfully")
}
