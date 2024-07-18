import { AIParsedResponse, AIFileInfo } from "@/types/ai"

export function mergePartialResults(
  existingResults: string,
  newResults: AIParsedResponse
): string {
  const existingParsed = existingResults ? JSON.parse(existingResults) as AIParsedResponse : { files: [], fileList: [], prTitle: "" }
  const mergedFiles: AIFileInfo[] = []
  const seenPaths = new Set<string>()

  // Merge files from existing results
  for (const file of existingParsed.files) {
    if (!seenPaths.has(file.path)) {
      mergedFiles.push(file)
      seenPaths.add(file.path)
    }
  }

  // Merge files from new results, updating or adding as necessary
  for (const file of newResults.files) {
    if (seenPaths.has(file.path)) {
      const existingIndex = mergedFiles.findIndex(f => f.path === file.path)
      if (existingIndex !== -1) {
        mergedFiles[existingIndex] = {
          ...mergedFiles[existingIndex],
          ...file,
          content: file.content || mergedFiles[existingIndex].content
        }
      }
    } else {
      mergedFiles.push(file)
      seenPaths.add(file.path)
    }
  }

  const mergedFileList = Array.from(new Set([...existingParsed.fileList, ...newResults.fileList]))
  const mergedPrTitle = newResults.prTitle || existingParsed.prTitle

  const mergedResults: AIParsedResponse = {
    files: mergedFiles,
    fileList: mergedFileList,
    prTitle: mergedPrTitle,
    isComplete: newResults.isComplete
  }

  return JSON.stringify(mergedResults)
}