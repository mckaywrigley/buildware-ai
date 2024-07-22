import { RunStep } from "@/types/run"

export const trackRunProgress = (step: RunStep): number => {
  switch (step) {
    case "started":
      return 10
    case "embedding":
      return 20
    case "retrieval":
      return 30
    case "clarify":
      return 40
    case "think":
      return 50
    case "plan":
      return 60
    case "act":
      return 70
    case "verify":
      return 80
    case "pr":
      return 90
    case "completed":
      return 100
    case null:
      return 1
    default:
      return 0
  }
}
