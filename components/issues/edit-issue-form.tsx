"use client"

import { getInstructionsByProjectId } from "@/db/queries/instructions-queries"
import { updateIssue } from "@/db/queries/issues-queries"
import {
  addInstructionToIssue,
  getInstructionsForIssue,
  removeInstructionFromIssue
} from "@/db/queries/issues-to-instructions-queries"
import { SelectIssue } from "@/db/schema"
import { useParams, useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { CRUDPage } from "../dashboard/reusable/crud-page"
import { MultiSelect } from "../ui/multi-select"

interface EditIssueFormProps {
  issue: SelectIssue
}

interface Instruction {
  id: string
  name: string
}

export const EditIssueForm: FC<EditIssueFormProps> = ({ issue }) => {
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([])
  const [allInstructions, setAllInstructions] = useState<Instruction[]>([])
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    handleAllInstructionsByProject(issue.projectId)
  }, [issue.projectId])

  const handleUpdateIssue = async (formData: FormData) => {
    try {
      await updateIssue(issue.id, {
        name: formData.get("name") as string,
        content: formData.get("content") as string
      })

      const currentInstructions = await getInstructionsForIssue(issue.id)
      const currentInstructionIds = new Set<string>(
        currentInstructions.map(p => p.instruction.id)
      )
      const selectedInstructionIds = new Set<string>(selectedInstructions)

      for (const instructionId of selectedInstructionIds) {
        if (!currentInstructionIds.has(instructionId)) {
          await addInstructionToIssue(issue.id, instructionId)
        }
      }

      for (const instructionId of currentInstructionIds) {
        if (!selectedInstructionIds.has(instructionId)) {
          await removeInstructionFromIssue(issue.id, instructionId)
        }
      }

      router.refresh()
      router.push(
        `/${params.workspaceId}/${params.projectId}/issues/${issue.id}`
      )
    } catch (error) {
      console.error("Failed to update issue:", error)
    }
  }

  const handleAllInstructionsByProject = async (projectId: string) => {
    const allInstructionsData = await getInstructionsByProjectId(projectId)
    const issueInstructions = await getInstructionsForIssue(issue.id)
    const formattedInstructions: Instruction[] = allInstructionsData.map(
      instruction => ({
        id: instruction.id,
        name: instruction.name
      })
    )
    setAllInstructions(formattedInstructions)
    setSelectedInstructions(issueInstructions.map(p => p.instruction.id))
  }

  return (
    <CRUDPage
      pageTitle="Edit Issue"
      backText="Back to issues"
      backLink={`/${params.workspaceId}/${params.projectId}/issues`}
    >
      {allInstructions.length > 0 && (
        <div className="mt-4">
          <MultiSelect
            label="Instruction"
            data={allInstructions.map(instruction => ({
              id: instruction.id,
              name: instruction.name
            }))}
            selectedIds={selectedInstructions}
            onToggleSelect={setSelectedInstructions}
          />
        </div>
      )}

      <div className="mt-4">
        <CRUDForm
          itemName="Issue"
          buttonText="Save"
          onSubmit={handleUpdateIssue}
          data={{
            name: issue.name,
            content: issue.content
          }}
        />
      </div>
    </CRUDPage>
  )
}
