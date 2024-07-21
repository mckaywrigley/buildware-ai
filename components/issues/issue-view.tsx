"use client"

import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SelectInstruction, SelectIssue, SelectProject } from "@/db/schema"
import { Pencil, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { CRUDPage } from "../dashboard/reusable/crud-page"
import { IssueContext } from "./issue-context"
import { ViewIssueInstruction } from "./view-issue-instruction"

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

export const IssueView: React.FC<IssueViewProps> = ({
  item,
  project,
  attachedInstructions,
  workspaceId
}) => {
  const router = useRouter()

  const [selectedInstruction, setSelectedInstruction] =
    useState<SelectInstruction | null>(null)

  return (
    <CRUDPage
      pageTitle={item.name}
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
                <Button variant="create" size="sm">
                  <Play className="mr-2 size-4" />
                  Run
                </Button>
              </Link>

              <IssueContext
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

          <Card className="mt-6">
            <CardContent className="bg-secondary/50 p-4">
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
