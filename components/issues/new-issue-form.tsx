"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { createIssue } from "@/db/queries/issue-queries"
import { SelectTemplate } from "@/db/schema/templates-schema"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { getPromptsForTemplate } from "@/db/queries/templates-to-prompts-queries"
import { getPromptsByProjectId } from "@/db/queries/prompt-queries";
import { addPromptToIssue } from "@/db/queries/issues-to-prompts-queries"
import { MultiSelect } from "../ui/multi-select"

interface NewIssueFormProps {
  templates: SelectTemplate[]
}

interface Prompt {
  id: string
  title: string
}

export function NewIssueForm({ templates }: NewIssueFormProps) {
  const params = useParams()
  const router = useRouter()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  )
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);

  const projectId = params.projectId as string

  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== "NULL") {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
      if (selectedTemplate) {
        setTitle(selectedTemplate.title)
        setContent(selectedTemplate.content)
        handlePromptsForTemplate(selectedTemplateId)
      }
    } else {
      setTitle("")
      setContent("")
      setSelectedPrompts([]) 
    }
  }, [selectedTemplateId])

  useEffect(() => {
    handleAllPromptsByProject(projectId);
  }, []);

  const handleCreateIssueAndRelation = async (formData: FormData) => {
    const newIssue = {
      name: formData.get("title") as string,
      content: formData.get("content") as string,
      projectId,
      templateId: selectedTemplateId || undefined
    }
    const issue = await createIssue(newIssue)
    
    for (const promptId of selectedPrompts) {
      await addPromptToIssue(issue.id, promptId)
    }

    router.refresh()
    router.push(`../issues/${issue.id}`)
  }

  const handlePromptsForTemplate = async (templateId: string) => {
    const promptsData = await getPromptsForTemplate(templateId)
    const formattedPrompts: Prompt[] = promptsData.map(item => ({
      id: item.prompt.id,
      title: item.prompt.title
    }))
    setSelectedPrompts(formattedPrompts.map(prompt => prompt.id))
  }

  const handleAllPromptsByProject = async (projectId: string) => {
    const allPromptsData = await getPromptsByProjectId(projectId);
    const formattedPrompts: Prompt[] = allPromptsData.map(prompt => ({
      id: prompt.id,
      title: prompt.title
    }));
    setAllPrompts(formattedPrompts);
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
              {template.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {allPrompts.length > 0 && (
        <div className="mt-4">
          <MultiSelect 
            label="Prompt"
            data={allPrompts.map(prompt => ({ id: prompt.id, name: prompt.title }))}
            selectedIds={selectedPrompts}
            onToggleSelect={setSelectedPrompts}
          />
        </div>
      )}

      <div className="mt-6">
        <CRUDForm
          itemName="Issue"
          buttonText="Create"
          onSubmit={handleCreateIssueAndRelation}
          data={{
            title,
            content
          }}
        />
      </div>
    </>
  )
}