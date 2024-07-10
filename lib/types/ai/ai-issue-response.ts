export interface AIFileInfo {
  path: string
  content: string
  language: string
  status: "new" | "modified" | "deleted"
}

export interface AIParsedResponse {
  fileList: string[]
  files: AIFileInfo[]
  prTitle: string
}
