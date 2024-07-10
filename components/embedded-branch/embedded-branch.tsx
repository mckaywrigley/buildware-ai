"use client"

import { SelectEmbeddedBranch, SelectProject } from "@/db/schema"
import { embedBranch } from "@/lib/actions/github/embed-branch"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { FC, HTMLAttributes, useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "../ui/alert-dialog"
import { Button } from "../ui/button"

interface EmbeddedBranchProps extends HTMLAttributes<HTMLDivElement> {
  project: SelectProject
  embeddedBranch: SelectEmbeddedBranch
}

export const EmbeddedBranch: FC<EmbeddedBranchProps> = ({
  project,
  embeddedBranch,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleUpdateEmbeddings = async () => {
    if (!project.githubInstallationId) {
      alert("No installation ID found for project")
      return
    }

    setIsOpen(false)
    setIsLoading(true)
    try {
      await embedBranch({
        projectId: embeddedBranch.projectId,
        githubRepoFullName: embeddedBranch.githubRepoFullName,
        branchName: embeddedBranch.branchName,
        embeddedBranchId: embeddedBranch.id,
        installationId: project.githubInstallationId
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", props.className)}>
      <div>{embeddedBranch.isUpdated ? "Up To Date" : "Out of Date"}</div>
      <div>{embeddedBranch.branchName}</div>

      {embeddedBranch.isUpdated ? (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Update Embeddings"
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Update</AlertDialogTitle>
              <AlertDialogDescription>
                This branch is already up to date. Are you sure you want to
                update again?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {/* <AlertDialogAction onClick={handleUpdateEmbeddings}> */}
              <Button variant="destructive" onClick={handleUpdateEmbeddings}>
                Update Anyway
              </Button>
              {/* </AlertDialogAction> */}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button onClick={handleUpdateEmbeddings} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Update Embeddings"
          )}
        </Button>
      )}
    </div>
  )
}
