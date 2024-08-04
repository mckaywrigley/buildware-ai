"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ResumeRunButtonProps {
  runId: string
  issueId: string
}

export const ResumeRunButton = ({ runId, issueId }: ResumeRunButtonProps) => {
  const router = useRouter()

  const handleResumeRun = () => {
    router.push(`/[workspaceId]/[projectId]/issues/${issueId}/run?runId=${runId}`)
  }

  return (
    <Button onClick={handleResumeRun} variant="outline">
      Resume Run
    </Button>
  )
}