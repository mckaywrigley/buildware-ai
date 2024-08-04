"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { createIssue } from "@/db/queries"
import { addContextGroupsToIssueBatch } from "@/db/queries/context-groups-queries"
import { addInstructionsToIssueBatch } from "@/db/queries/instructions-queries"
import { getInstructionsForTemplate } from "@/db/queries/templates-to-instructions-queries"
import { SelectInstruction } from "@/db/schema"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import { SelectTemplate } from "@/db/schema/templates-schema"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { MultiSelect } from "../ui/multi-select"
import { ImproveIssue } from "./improve-issue"

interface CreateIssueProps {
  templates: SelectTemplate[]
  contextGroups: SelectContextGroup[]
  instructions: SelectInstruction[]
}

export const CreateIssue = ({
  templates,
  contextGroups,
  instructions
}: CreateIssueProps) => {
  const params = useParams()
  const router = useRouter()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  )
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([])
  const [allInstructions] = useState<SelectInstruction[]>(instructions)
  const [selectedContextGroups, setSelectedContextGroups] = useState<string[]>(
    []
  )

  const projectId = params.projectId as string

  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== "NULL") {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
      if (selectedTemplate) {
        setName(selectedTemplate.name)
        setContent(selectedTemplate.content)
        handleInstructionsForTemplate(selectedTemplateId)
      }
    } else {
      setName("")
      setContent("")
      setSelectedInstructions([])
    }
  }, [selectedTemplateId])

  const handleCreateIssueAndRelation = async () => {
    const newIssue = {
      name,
      content,
      projectId,
      templateId: selectedTemplateId || undefined
    }
    const issue = await createIssue(newIssue)

    if (selectedInstructions.length > 0) {
      await addInstructionsToIssueBatch(issue.id, selectedInstructions)
    }

    if (selectedContextGroups.length > 0) {
      await addContextGroupsToIssueBatch(issue.id, selectedContextGroups)
    }

    router.refresh()
    router.push(`../issues/${issue.id}`)
  }

  const handleInstructionsForTemplate = async (templateId: string) => {
    const instructionsData = await getInstructionsForTemplate(templateId)
    const formattedInstructions = instructionsData.map(item => ({
      id: item.instruction.id,
      name: item.instruction.name
    }))
    setSelectedInstructions(
      formattedInstructions.map(instruction => instruction.id)
    )
  }

  return (
    <>
      <Select
        onValueChange={setSelectedTemplateId}
        value={selectedTemplateId || ""}
      >
        <SelectTrigger className="bg-secondary/50">
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="NULL">No Template</SelectItem>

          {templates.map(template => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

      {contextGroups.length > 0 && (
        <div className="mt-4">
          <MultiSelect
            label="Context Group"
            data={contextGroups.map(group => ({
              id: group.id,
              name: group.name
            }))}
            selectedIds={selectedContextGroups}
            onToggleSelect={setSelectedContextGroups}
          />
        </div>
      )}

      <div className="mt-4 flex w-full justify-end gap-2">
        <ImproveIssue
          startingIssue={{ name, content }}
          onUpdateIssue={({ name, content }) => {
            setName(name)
            setContent(content)
          }}
        />
      </div>

      <div className="mt-4">
        <CRUDForm
          itemName="Issue"
          buttonText="Create"
          onSubmit={handleCreateIssueAndRelation}
          data={{
            name,
            content
          }}
          onContentChange={setContent}
          onNameChange={setName}
        />
      </div>
    </>
  )
}
