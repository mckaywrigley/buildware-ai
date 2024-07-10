"use client"

import { Button } from "@/components/ui/button"
import { createProject } from "@/db/queries/project-queries"
import { cn } from "@/lib/utils"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, HTMLAttributes } from "react"

interface CreateProjectButtonProps extends HTMLAttributes<HTMLDivElement> {}

export const CreateProjectButton: FC<CreateProjectButtonProps> = ({
  ...props
}) => {
  const router = useRouter()

  const handleCreateProject = async () => {
    try {
      const project = await createProject({ name: "New Project" })
      router.push(`/${project.id}/setup`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={cn("", props.className)}>
      <Button
        variant="outline"
        onClick={handleCreateProject}
        className="w-full"
      >
        <PlusIcon className="mr-2 size-4" />
        Create Project
      </Button>
    </div>
  )
}
