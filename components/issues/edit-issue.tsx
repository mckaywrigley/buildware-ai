"use client"

import {
  addContextGroupToIssue,
  removeContextGroupFromIssue
} from "@/db/queries/issue-to-context-groups-queries"
import { deleteIssue, updateIssue } from "@/db/queries/issues-queries"
import {
  addInstructionToIssue,
  removeInstructionFromIssue
} from "@/db/queries/issues-to-instructions-queries"
import { SelectContextGroup, SelectInstruction, SelectIssue } from "@/db/schema"
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
  allContextGroups: SelectContextGroup[]
  selectedContextGroupIds: string[]
}

export const EditIssue = ({
  issue,
  allInstructions,
  selectedInstructionIds,
  allContextGroups,
  selectedContextGroupIds
}: EditIssueProps) => {
  const router = useRouter()
  const params = useParams()

  const [name, setName] = useState(issue.name)
  const [content, setContent] = useState(issue.content)
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>(
    selectedInstructionIds
  )
  const [selectedContextGroups, setSelectedContextGroups] = useState<string[]>(
    selectedContextGroupIds
  )

  const handleUpdateIssue = async () => {
    await updateIssue(issue.id, { name, content })

    // Handle instructions
    const currentInstructions = new Set(selectedInstructionIds)
    const newInstructions = new Set(selectedInstructions)

    for (const instructionId of newInstructions) {
      if (!currentInstructions.has(instructionId)) {
        await addInstructionToIssue(issue.id, instructionId)
      }
    }

    for (const instructionId of currentInstructions) {
      if (!newInstructions.has(instructionId)) {
        await removeInstructionFromIssue(issue.id, instructionId)
      }
    }

    // Handle context groups
    const currentContextGroups = new Set(selectedContextGroupIds)
    const newContextGroups = new Set(selectedContextGroups)

    for (const contextGroupId of newContextGroups) {
      if (!currentContextGroups.has(contextGroupId)) {
        await addContextGroupToIssue(issue.id, contextGroupId)
      }
    }

    for (const contextGroupId of currentContextGroups) {
      if (!newContextGroups.has(contextGroupId)) {
        await removeContextGroupFromIssue(issue.id, contextGroupId)
      }
    }

    router.refresh()
    router.push(`/${params.workspaceId}/${params.projectId}/issues/${issue.id}`)
  }

  const handleDeleteIssue = async () => {
    await deleteIssue(issue.id)
    router.refresh()
    router.push(`/${params.workspaceId}/${params.projectId}/issues`)
  }

  return (
    <CRUDPage
      pageTitle="Edit Issue"
      backText="Back to Issues"
      backLink={`/${params.workspaceId}/${params.projectId}/issues`}
    >
      <div className="flex w-full justify-end gap-2">
        <ViewIssueContext
          name={name}
          content={content}
          selectedInstructions={allInstructions.filter(instruction =>
            selectedInstructions.includes(instruction.id)
          )}
          selectedContextGroups={allContextGroups.filter(group =>
            selectedContextGroups.includes(group.id)
          )}
        />

        <ImproveIssue
          startingIssue={{ name, content }}
          onUpdateIssue={({ name, content }) => {
            setName(name)
            setContent(content)
          }}
        />
      </div>

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

      <div className="my-4">
        <MultiSelect
          label="Context Group"
          data={allContextGroups.map(group => ({
            id: group.id,
            name: group.name
          }))}
          selectedIds={selectedContextGroups}
          onToggleSelect={setSelectedContextGroups}
        />
      </div>

      <CRUDForm
        itemName="Issue"
        buttonText="Update"
        onSubmit={handleUpdateIssue}
        onDelete={handleDeleteIssue}
        data={{
          name,
          content
        }}
        onContentChange={setContent}
        onNameChange={setName}
      />
    </CRUDPage>
  )
}
