"use client"

import { updateIssue } from "@/db/queries/issue-queries"
import { SelectIssue } from "@/db/schema"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { CRUDForm } from "../dashboard/reusable/crud-form"
import { CRUDPage } from "../dashboard/reusable/crud-page"
import { getPromptsByProjectId } from "@/db/queries/prompt-queries"
import { MultiSelect } from "../ui/multi-select"
import { addPromptToIssue, getPromptsForIssue, removePromptFromIssue } from "@/db/queries/issues-to-prompts-queries"

interface EditIssueFormProps {
  issue: SelectIssue
}

interface Prompt {
  id: string
  title: string
}

export const EditIssueForm: FC<EditIssueFormProps> = ({ issue }) => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const router = useRouter()

  useEffect(() => {
    setTitle(issue.name)
    setContent(issue.content)
    handleAllPromptsByProject(issue.projectId)
  }, [])

  const handleUpdateIssue = async (formData: FormData) => {
    try {
      await updateIssue(issue.id, {
        name: formData.get("title") as string,
        content: formData.get("content") as string
      });

      const currentPrompts = await getPromptsForIssue(issue.id);
      const currentPromptIds = new Set<string>(currentPrompts.map(p => p.prompt.id));
      const selectedPromptIds = new Set<string>(selectedPrompts);

      for (const promptId of selectedPromptIds) {
        if (!currentPromptIds.has(promptId)) {
          await addPromptToIssue(issue.id, promptId);
        }
      }

      for (const promptId of currentPromptIds) {
        if (!selectedPromptIds.has(promptId)) {
          await removePromptFromIssue(issue.id, promptId);
        }
      }

      router.refresh();
      router.push(`/${issue.projectId}/issues/${issue.id}`);
    } catch (error) {
      console.error("Failed to update issue:", error);
    }
  }

  const handleAllPromptsByProject = async (projectId: string) => {
    const allPromptsData = await getPromptsByProjectId(projectId);
    const issuePrompts = await getPromptsForIssue(issue.id);
    const formattedPrompts: Prompt[] = allPromptsData.map(prompt => ({
      id: prompt.id,
      title: prompt.title
    }));
    setAllPrompts(formattedPrompts);
    setSelectedPrompts(issuePrompts.map(p => p.prompt.id))
  }

  return (
    <CRUDPage
      pageTitle="Edit Issue"
      backText="Back to issues"
      backLink={`/${issue.projectId}/issues`}
    >
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

      <div className="mt-4">
        <CRUDForm
          itemName="Issue"
          buttonText="Save"
          onSubmit={handleUpdateIssue}
          data={{
            title,
            content
          }}
        />
      </div>
    </CRUDPage>
  )
}