"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { updateProject } from "@/db/queries/project-queries"
import { SelectProject } from "@/db/schema"
import { embedTargetBranch } from "@/lib/actions/github/embed-target-branch"
import { listBranches } from "@/lib/actions/github/list-branches"
import { GitHubRepository } from "@/lib/types/github"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { FC, HTMLAttributes, useEffect, useState } from "react"
import { ConnectGitHub } from "../integrations/connect-github"
import { ConnectLinear } from "../integrations/connect-linear"

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

  const [projectName, setProjectName] = useState(project.name)
  const [targetBranch, setTargetBranch] = useState(project.githubTargetBranch)
  const [selectedRepo, setSelectedRepo] = useState(project.githubRepoFullName)
  const [branches, setBranches] = useState<string[]>([])
  const [isBranchesLoading, setIsBranchesLoading] = useState(false)
  const [isEmbedding, setIsEmbedding] = useState(false)

  const handleRepoSelect = (fullRepoName: string) => {
    setSelectedRepo(fullRepoName)
    setProjectName(fullRepoName.split("/")[1])
    setTargetBranch(null)
  }

  useEffect(() => {
    if (selectedRepo && project.githubInstallationId) {
      setIsBranchesLoading(true)
      listBranches(project.githubInstallationId, selectedRepo)
        .then(setBranches)
        .catch(console.error)
        .finally(() => setIsBranchesLoading(false))
    }
  }, [selectedRepo, project.githubInstallationId])

  const isSetupComplete =
    project.githubInstallationId && projectName && selectedRepo && targetBranch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSetupComplete || !project.githubInstallationId) {
      return
    }

    setIsEmbedding(true)

    try {
      await updateProject(project.id, {
        name: projectName,
        githubRepoFullName: selectedRepo,
        githubTargetBranch: targetBranch,
        hasSetup: true
      })

      await embedTargetBranch({
        projectId: project.id,
        githubRepoFullName: selectedRepo,
        branchName: targetBranch,
        installationId: project.githubInstallationId
      })

      router.push(`/${project.id}/issues`)
    } catch (error) {
      console.error("Error during setup:", error)
    } finally {
      setIsEmbedding(false)
    }
  }

  return (
    <div className={cn("bg-secondary/50 rounded border", props.className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="w-full min-w-[400px] gap-6 space-y-6 p-12">
          {[
            {
              title: "Connect to GitHub",
              component: (
                <ConnectGitHub
                  isGitHubConnected={!!project.githubInstallationId}
                />
              )
            },
            {
              title: "Connect to Linear (optional)",
              component: (
                <ConnectLinear
                  isLinearConnected={!!project.linearAccessToken}
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
            disabled={!isSetupComplete || isEmbedding}
            onClick={handleSubmit}
          >
            {isEmbedding
              ? "Embedding..."
              : !isSetupComplete
                ? "Complete required setup"
                : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
