"use client"

import { createEmbeddedBranch } from "@/db/queries/embedded-branch-queries"
import { SelectProject } from "@/db/schema"
import { useRouter } from "next/navigation"
import { FC } from "react"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select"

interface NewEmbeddedBranchFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  project: SelectProject
  branches: string[]
}

export const NewEmbeddedBranchForm: FC<NewEmbeddedBranchFormProps> = ({
  project,
  branches
}) => {
  const router = useRouter()

  const handleCreateEmbeddedBranch = async (formData: FormData) => {
    const newEmbeddedBranch = {
      projectId: project.id,
      githubRepoFullName: project.githubRepoFullName as string,
      branchName: formData.get("branchName") as string,
      isUpdated: false
    }
    const embeddedBranch = await createEmbeddedBranch(newEmbeddedBranch)
    router.refresh()
    router.push(`../embeddings/${embeddedBranch.id}`)
  }

  return (
    <form className="flex flex-col gap-6" action={handleCreateEmbeddedBranch}>
      <div className="flex flex-col gap-4">
        <Select name="branchName" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map(branch => (
              <SelectItem key={branch} value={branch}>
                {branch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="ml-auto space-x-2">
          <Button
            type="button"
            className="bg-secondary hover:bg-secondary/80"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>

          <Button variant="create">Create</Button>
        </div>
      </div>
    </form>
  )
}
