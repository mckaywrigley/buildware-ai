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

export interface AIPlanStep {
  number: number
  text: string
}

export interface AIParsedPlanResponse {
  steps: AIPlanStep[]
}

export interface AIClarificationItem {
  type:
    | "question"
    | "confirmation"
    | "file_request"
    | "info_request"
    | "priority"
    | "timeline"
    | "dependency"
    | "constraint"
    | "scope"
    | "technical_details"
    | "user_story"
    | "acceptance_criteria"
    | "resource"
  content: string
  options?: string[]
}

export interface AIParsedClarifyResponse {
  clarifications: AIClarificationItem[]
}
