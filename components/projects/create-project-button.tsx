"use client"

import { Button } from "@/components/ui/button"
import { createProject } from "@/db/queries/project-queries"
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
      router.push(`/${params.workspaceId}/${project.id}/setup`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={cn("", props.className)}>
      <Button
        onClick={handleCreateProject}
        size="icon"
        className="hover:bg-accent hover:text-accent-foreground bg-black text-white transition-colors"
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  )
}
