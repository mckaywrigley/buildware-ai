export type RunStep =
  | "started"
  | "embedding"
  | "retrieval"
  | "clarify"
  | "think"
  | "plan"
  | "act"
  | "verify"
  | "pr"
  | "completed"
  | null
