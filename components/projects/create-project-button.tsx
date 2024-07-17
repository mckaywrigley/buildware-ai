"use client"

import { createProject } from "@/db/queries/projects-queries"
import { cn } from "@/lib/utils"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, HTMLAttributes } from "react"

interface CreateProjectButtonProps extends HTMLAttributes<HTMLDivElement> {
  params: {
    workspaceId: string
  }
}

export const CreateProjectButton: FC<CreateProjectButtonProps> = ({
  params,
  ...props
}) => {
  const router = useRouter()

  const handleCreateProject = async () => {
    try {
      const project = await createProject({
        name: "New Project",
        workspaceId: params.workspaceId
      })
      router.refresh()
      router.push(`/${params.workspaceId}/${project.id}/settings`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={cn("", props.className)}>
      <div
        className="hover:bg-accent hover:text-accent-foreground flex size-5 cursor-pointer items-center justify-center rounded-md bg-black text-white transition-colors"
        onClick={handleCreateProject}
      >
        <PlusIcon className="size-4" />
      </div>
    </div>
  )
}
