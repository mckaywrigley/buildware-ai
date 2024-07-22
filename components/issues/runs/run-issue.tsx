"use client"

import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import {
  SelectInstruction,
  SelectIssue,
  SelectIssueMessage,
  SelectProject
} from "@/db/schema"
import { useRunIssue } from "@/lib/hooks/use-run-issue"
import { FC } from "react"
import { RunIssueContent } from "./run-issue-content"

interface RunIssueProps {
  issue: SelectIssue
  initialIssueMessages: SelectIssueMessage[]
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
}

export const RunIssue: FC<RunIssueProps> = ({
  issue,
  initialIssueMessages,
  project,
  attachedInstructions
}) => {
  const {
    isRunning,
    currentStep,
    messages,
    clarifications,
    thoughts,
    planSteps,
    generatedFiles,
    handleRun,
    setThoughts,
    setClarifications,
    setPlanSteps,
    setGeneratedFiles
  } = useRunIssue(issue, initialIssueMessages, project, attachedInstructions)

  return (
    <CRUDPage pageTitle={`Run issue`} backText="Back to issue" backLink={`./`}>
      <RunIssueContent
        issue={issue}
        isRunning={isRunning}
        currentStep={currentStep}
        messages={messages}
        clarifications={clarifications}
        thoughts={thoughts}
        planSteps={planSteps}
        generatedFiles={generatedFiles}
        onRun={handleRun}
        setClarifications={setClarifications}
        setThoughts={setThoughts}
        setPlanSteps={setPlanSteps}
        setGeneratedFiles={setGeneratedFiles}
      />
    </CRUDPage>
  )
}
