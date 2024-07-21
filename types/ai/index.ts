export interface AIFileInfo {
  path: string
  content: string
  language: string
  status: "new" | "modified" | "deleted"
}

export interface AIParsedResponse {
  files: AIFileInfo[]
  prTitle: string
  prDescription: string
}

export interface AIThought {
  number: number
  text: string
}

export interface AIParsedThinkResponse {
  thoughts: AIThought[]
}

export interface AIStep {
  number: number
  text: string
}

export interface AIParsedPlanResponse {
  steps: AIStep[]
}
