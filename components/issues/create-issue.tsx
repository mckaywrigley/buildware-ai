"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { createIssue, getInstructionsByProjectId } from "@/db/queries"
import { addInstructionToIssue } from "@/db/queries/issues-to-instructions-queries"
import { getInstructionsForTemplate } from "@/db/queries/templates-to-instructions-queries"
import { SelectInstruction } from "@/db/schema"
import { SelectTemplate } from "@/db/schema/templates-schema"
import { useParams, useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { MultiSelect } from "../ui/multi-select"
import { IssueImprover } from "./improve-issue"
import { IssueContext } from "./view-issue-context"

interface CreateIssueProps {
  templates: SelectTemplate[]
}

export const CreateIssue: FC<CreateIssueProps> = ({ templates }) => {
  const params = useParams()
  const router = useRouter()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  )
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([])
  const [allInstructions, setAllInstructions] = useState<SelectInstruction[]>(
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

  useEffect(() => {
    fetchAllInstructions()
  }, [])

  const fetchAllInstructions = async () => {
    const allInstructionsData = await getInstructionsByProjectId(projectId)
    setAllInstructions(allInstructionsData)
  }

  const handleCreateIssueAndRelation = async () => {
    const newIssue = {
      name,
      content,
      projectId,
      templateId: selectedTemplateId || undefined
    }
    const issue = await createIssue(newIssue)

    for (const instructionId of selectedInstructions) {
      await addInstructionToIssue(issue.id, instructionId)
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

      <div className="mt-4 flex w-full justify-end gap-2">
        <IssueContext
          name={name}
          content={content}
          selectedInstructions={allInstructions.filter(instruction =>
            selectedInstructions.includes(instruction.id)
          )}
        />

        <IssueImprover
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
