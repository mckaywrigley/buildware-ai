"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { getInstructionsByProjectId } from "@/db/queries/instructions-queries"
import { createIssue } from "@/db/queries/issues-queries"
import { addInstructionToIssue } from "@/db/queries/issues-to-instructions-queries"
import { getInstructionsForTemplate } from "@/db/queries/templates-to-instructions-queries"
import { SelectTemplate } from "@/db/schema/templates-schema"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { MultiSelect } from "../ui/multi-select"

interface NewIssueFormProps {
  templates: SelectTemplate[]
}

interface Instruction {
  id: string
  name: string
}

export function NewIssueForm({ templates }: NewIssueFormProps) {
  const params = useParams()
  const router = useRouter()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  )
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([])
  const [allInstructions, setAllInstructions] = useState<Instruction[]>([])

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
    handleAllInstructionsByProject(projectId)
  }, [])

  const handleCreateIssueAndRelation = async (formData: FormData) => {
    const newIssue = {
      name: formData.get("name") as string,
      content: formData.get("content") as string,
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
    const formattedInstructions: Instruction[] = instructionsData.map(item => ({
      id: item.instruction.id,
      name: item.instruction.name
    }))
    setSelectedInstructions(
      formattedInstructions.map(instruction => instruction.id)
    )
  }

  const handleAllInstructionsByProject = async (projectId: string) => {
    const allInstructionsData = await getInstructionsByProjectId(projectId)
    const formattedInstructions: Instruction[] = allInstructionsData.map(
      instruction => ({
        id: instruction.id,
        name: instruction.name
      })
    )
    setAllInstructions(formattedInstructions)
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

      <div className="mt-6">
        <CRUDForm
          itemName="Issue"
          buttonText="Create"
          onSubmit={handleCreateIssueAndRelation}
          data={{
            name,
            content
          }}
        />
      </div>
    </>
  )
}
