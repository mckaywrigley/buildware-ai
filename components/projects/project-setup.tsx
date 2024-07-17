"use client"

import { listBranches } from "@/actions/github/list-branches"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { updateProject } from "@/db/queries/projects-queries"
import { SelectProject } from "@/db/schema"
import { cn } from "@/lib/utils"
import { GitHubRepository } from "@/types/github"
import { useParams, useRouter } from "next/navigation"
import { FC, HTMLAttributes, useEffect, useState } from "react"
import { ConnectGitHub } from "../integrations/connect-github"
import { DeleteProjectButton } from "./delete-project-button"

interface ProjectSetupProps extends HTMLAttributes<HTMLDivElement> {
  project: SelectProject
  repos: GitHubRepository[]
}

export const ProjectSetup: FC<ProjectSetupProps> = ({
  project,
  repos,
  ...props
}) => {
  const router = useRouter()
  const params = useParams()

  const [projectName, setProjectName] = useState(project.name)
  const [targetBranch, setTargetBranch] = useState(project.githubTargetBranch)
  const [selectedRepo, setSelectedRepo] = useState(project.githubRepoFullName)
  const [branches, setBranches] = useState<string[]>([])
  const [isBranchesLoading, setIsBranchesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRepoSelect = (fullRepoName: string) => {
    setSelectedRepo(fullRepoName)
    setProjectName(fullRepoName.split("/")[1])
    setTargetBranch(null)
  }

  useEffect(() => {
    if (selectedRepo) {
      setIsBranchesLoading(true)
      listBranches(project.githubInstallationId, selectedRepo)
        .then(setBranches)
        .catch(console.error)
        .finally(() => setIsBranchesLoading(false))
    }
  }, [selectedRepo, project.githubInstallationId])

  const isSetupComplete =
    (process.env.NEXT_PUBLIC_APP_MODE === "simple" ||
      project.githubInstallationId) &&
    projectName &&
    selectedRepo &&
    targetBranch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    if (!isSetupComplete) {
      return
    }

    try {
      await updateProject(project.id, {
        name: projectName,
        githubRepoFullName: selectedRepo,
        githubTargetBranch: targetBranch
      })

      router.push(`/${project.workspaceId}/${project.id}/issues`)
    } catch (error) {
      console.error("Error during setup:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("bg-secondary/50 rounded border", props.className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="w-full min-w-[400px] gap-6 space-y-6 p-12">
          {process.env.NEXT_PUBLIC_APP_MODE !== "simple" &&
            [
              {
                title: "Connect to GitHub",
                component: (
                  <ConnectGitHub
                    isGitHubConnected={!!project.githubInstallationId}
                  />
                )
              }
            ].map(({ title, component }) => (
              <div key={title} className="space-y-1">
                <div className="font-semibold">{title}</div>
                {component}
              </div>
            ))}

          {project.githubInstallationId !== 0 && (
            <>
              <div>
                <div className="mb-1 font-semibold">
                  Select GitHub Repository
                </div>

                <Select
                  onValueChange={value => handleRepoSelect(value)}
                  value={selectedRepo || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>

                  <SelectContent>
                    {repos.map(repo => (
                      <SelectItem key={repo.id} value={repo.full_name}>
                        {repo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-1 font-semibold">Project Name</div>

                <Input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <div className="mb-1 font-semibold">Target Branch</div>
                <Select
                  value={targetBranch || ""}
                  onValueChange={setTargetBranch}
                  disabled={!selectedRepo || isBranchesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isBranchesLoading
                          ? "Loading branches..."
                          : "Select target branch"
                      }
                    />
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
            </>
          )}

          <Button
            className="w-full"
            variant={isSetupComplete ? "create" : "outline"}
            type="submit"
            disabled={!isSetupComplete || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>

          <DeleteProjectButton
            className="w-full"
            projectId={params.projectId as string}
            workspaceId={params.workspaceId as string}
          />
        </div>
      </div>
    </div>
  )
}
