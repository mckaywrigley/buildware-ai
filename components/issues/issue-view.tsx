"use client"

import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import { Pencil, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CRUDPage } from "../dashboard/reusable/crud-page"
import { ViewIssueContext } from "./view-issue-context"
import { ViewIssueInstruction } from "./view-issue-instruction"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getContextGroups } from "@/actions/context-groups/get-context-groups"

interface IssueViewProps {
  item: SelectIssue
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
  workspaceId: string
}

export const IssueView = ({
  item,
  project,
  attachedInstructions,
  workspaceId
}: IssueViewProps) => {
  const router = useRouter()

  const [selectedInstruction, setSelectedInstruction] =
    useState<SelectInstruction | null>(null)
  const [contextGroups, setContextGroups] = useState<{ id: string; name: string }[]>([])
  const [selectedContextGroupIds, setSelectedContextGroupIds] = useState<string[]>([])

  useState(() => {
    const fetchContextGroups = async () => {
      try {
        const groups = await getContextGroups(project.id)
        setContextGroups(groups)
      } catch (error) {
        console.error("Error fetching context groups:", error)
      }
    }
    fetchContextGroups()
  }, [project.id])

  return (
    <CRUDPage
      pageTitle={`View issue`}
      backText="Back to Issues"
      backLink={`../issues`}
    >
      <div className="flex w-full justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Link
                href={`/${workspaceId}/${project.id}/issues/${item.id}/run`}
                passHref
              >
                <Button variant="create">
                  <Play className="mr-2 size-4" />
                  Run
                </Button>
              </Link>

              <ViewIssueContext
                name={item.name}
                content={item.content}
                selectedInstructions={attachedInstructions.map(
                  ai => ai.instruction
                )}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  `/${workspaceId}/${item.projectId}/issues/${item.id}/edit`
                )
              }
            >
              <Pencil className="mr-2 size-4" />
              Edit Issue
            </Button>
          </div>

          {attachedInstructions.length > 0 && (
            <div className="my-6">
              <div className="mb-2 text-lg font-semibold">
                Attached instructions
              </div>
              <div className="flex flex-wrap gap-2">
                {attachedInstructions.map(instruction => (
                  <Button
                    key={instruction.instructionId}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedInstruction(instruction.instruction)
                    }
                  >
                    {instruction.instruction.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="mb-2 text-lg font-semibold">Context Groups</div>
            <Select
              value={selectedContextGroupIds.join(",")}
              onValueChange={(value) => setSelectedContextGroupIds(value.split(","))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select context groups" />
              </SelectTrigger>
              <SelectContent>
                {contextGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-secondary/50 flex flex-col gap-2 p-4">
            <CardTitle>{item.name}</CardTitle>

            <CardContent className="p-0">
              <MessageMarkdown content={item.content} />
            </CardContent>
          </Card>
        </div>
      </div>

      <ViewIssueInstruction
        selectedInstruction={selectedInstruction}
        onClose={() => setSelectedInstruction(null)}
      />
    </CRUDPage>
  )
}