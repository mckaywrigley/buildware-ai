"use client"

import { deleteIssue, updateIssue } from "@/db/queries/issues-queries"
import {
  addInstructionToIssue,
  getInstructionsByIssueId,
  removeInstructionFromIssue
} from "@/db/queries/issues-to-instructions-queries"
import { SelectInstruction, SelectIssue } from "@/db/schema"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { CRUDPage } from "../dashboard/reusable/crud-page"
import { MultiSelect } from "../ui/multi-select"
import { ImproveIssue } from "./improve-issue"
import { ViewIssueContext } from "./view-issue-context"

interface EditIssueProps {
  issue: SelectIssue
  allInstructions: SelectInstruction[]
  selectedInstructionIds: string[]
}

export const EditIssue = ({
  issue,
  allInstructions,
  selectedInstructionIds
}: EditIssueProps) => {
  const router = useRouter()
  const params = useParams()

  const [selectedInstructions, setSelectedInstructions] = useState<string[]>(
    selectedInstructionIds
  )
  const [name, setName] = useState(issue.name)
  const [content, setContent] = useState(issue.content)

  const handleUpdateIssue = async (formData: FormData) => {
    try {
      await updateIssue(issue.id, {
        name: formData.get("name") as string,
        content: formData.get("content") as string
      })

      const currentInstructions = await getInstructionsByIssueId(issue.id)
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

  const handleDeleteIssue = async () => {
    await deleteIssue(issue.id)
    router.refresh()
    router.push(`/${params.workspaceId}/${params.projectId}/issues`)
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

      <div className="mt-4 flex w-full justify-end gap-2">
        <ViewIssueContext
          name={name}
          content={content}
          selectedInstructions={allInstructions.filter(instruction =>
            selectedInstructions.includes(instruction.id)
          )}
        />

        <ImproveIssue
          startingIssue={{ name, content }}
          onUpdateIssue={({ name: newName, content: newContent }) => {
            setName(newName)
            setContent(newContent)
          }}
        />
      </div>

      <div className="mt-4">
        <CRUDForm
          itemName="Issue"
          buttonText="Save"
          onSubmit={handleUpdateIssue}
          data={{
            name,
            content
          }}
          onContentChange={setContent}
          onNameChange={setName}
          onDelete={handleDeleteIssue}
        />
      </div>
    </CRUDPage>
  )
}
