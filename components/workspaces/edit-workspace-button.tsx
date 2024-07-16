import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { HTMLAttributes } from "react"

interface EditWorkspaceButtonProps extends HTMLAttributes<HTMLDivElement> {
  workspaceId: string
}

export function EditWorkspaceButton({
  workspaceId,
  ...props
}: EditWorkspaceButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/${workspaceId}/edit`)
  }

  return (
    <div className={cn("", props.className)}>
      <Button
        onClick={handleClick}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Pencil className="mr-2 size-4" />
        Workspace Settings
      </Button>
    </div>
  )
}
