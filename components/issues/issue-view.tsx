"use client"

import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  SelectContextGroup,
  SelectInstruction,
  SelectIssue,
  SelectProject
} from "@/db/schema"
import { Eye, File, Folder, List, Pencil, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CRUDPage } from "../dashboard/reusable/crud-page"
import { ViewIssueContext } from "./view-issue-context"
import { ViewIssueInstruction } from "./view-issue-instruction"

interface IssueViewProps {
  item: SelectIssue
  project: SelectProject
  attachedInstructions: {
    instructionId: string
    issueId: string
    instruction: SelectInstruction
  }[]
  attachedContextGroups: {
    contextGroupId: string
    issueId: string
    contextGroup: SelectContextGroup & {
      files: {
        id: string
        path: string
        type: "file" | "folder"
      }[]
    }
  }[]
  workspaceId: string
}

export const IssueView = ({
  item,
  project,
  attachedInstructions,
  attachedContextGroups,
  workspaceId
}: IssueViewProps) => {
  const router = useRouter()

  const [selectedInstruction, setSelectedInstruction] =
    useState<SelectInstruction | null>(null)

  const [selectedContextGroup, setSelectedContextGroup] = useState<
    (typeof attachedContextGroups)[0] | null
  >(null)

  const [showAllFiles, setShowAllFiles] = useState(false)

  const allFiles = attachedContextGroups.flatMap(cg => cg.contextGroup.files)

  return (
    <CRUDPage
      pageTitle={`View issue`}
      backText="Back to Issues"
      backLink={`../issues`}
    >
      <div className="flex w-full justify-between">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Link href={`./${item.id}/run`}>
                <Button variant="create">
                  <Play className="mr-2 size-4" />
                  Run
                </Button>
              </Link>

              <Link href={`./${item.id}/run/history`}>
                <Button>
                  <List className="mr-2 size-4" />
                  View Run History
                </Button>
              </Link>

              <ViewIssueContext
                name={item.name}
                content={item.content}
                selectedInstructions={attachedInstructions.map(
                  ai => ai.instruction
                )}
                attachedContextGroups={attachedContextGroups}
              />
            </div>

            <Button
              variant="outline"
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

          {attachedContextGroups.length > 0 && (
            <div className="my-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-semibold">
                  Attached Context Groups
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllFiles(true)}
                >
                  <Eye className="mr-2 size-4" />
                  View All Files
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {attachedContextGroups.map(contextGroupData => (
                  <Button
                    key={contextGroupData.contextGroup.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedContextGroup(contextGroupData)}
                  >
                    {contextGroupData.contextGroup.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

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

      <Dialog
        open={!!selectedContextGroup}
        onOpenChange={() => setSelectedContextGroup(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContextGroup?.contextGroup.name} - Attached Files
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedContextGroup?.contextGroup.files.map(file => (
              <div key={file.id} className="flex items-center py-1">
                {file.type === "file" ? (
                  <File className="mr-2 size-4" />
                ) : (
                  <Folder className="mr-2 size-4" />
                )}

                <span>{file.path}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAllFiles} onOpenChange={setShowAllFiles}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Attached Files</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {allFiles.map(file => (
              <div key={file.id} className="flex items-center py-1">
                {file.type === "file" ? (
                  <File className="mr-2 size-4" />
                ) : (
                  <Folder className="mr-2 size-4" />
                )}

                <span>{file.path}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </CRUDPage>
  )
}