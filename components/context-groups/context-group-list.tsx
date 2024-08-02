"use client"

import { Card, CardHeader, CardTitle } from "../ui/card"
import Link from "next/link"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import { Pencil, MoreHorizontal, Trash } from "lucide-react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Separator } from "../ui/separator"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteContextGroup } from "@/db/queries/context-groups-queries"

interface ContextGroupListProps {
  contextGroups: SelectContextGroup[]
}

export const ContextGroupList: React.FC<ContextGroupListProps> = ({
  contextGroups
}) => {
  const router = useRouter()
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)

  if (contextGroups.length === 0) {
    return <div>No context groups found.</div>
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContextGroup(id)
      router.refresh()
    } catch (error) {
      console.error("Error deleting context group:", error)
    }
  }

  return (
    <div className="space-y-4">
      {contextGroups.map(group => (
        <div
          key={group.id}
          className="group relative"
          onMouseEnter={() => setHoveredGroup(group.id)}
          onMouseLeave={() => setHoveredGroup(null)}
        >
          <Link href={`./context/${group.id}`}>
            <Card className="bg-secondary border-primary/20 hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          {hoveredGroup === group.id && (
            <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
              <Link href={`./context/${group.id}/edit`}>
                <Pencil className="text-primary/30 size-4 cursor-pointer hover:text-white" />
              </Link>
              <Popover>
                <PopoverTrigger>
                  <MoreHorizontal className="text-primary/30 size-4 cursor-pointer hover:text-white" />
                </PopoverTrigger>
                <PopoverContent className="bg-secondary border-primary/20 w-[300px] rounded border p-4">
                  <div className="flex flex-col space-y-2">
                    <Link href={`./context/${group.id}/edit`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-gray-700"
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Button>
                    </Link>
                    <Separator className="bg-primary/20" />
                    <Button
                      variant="ghost"
                      className="justify-start text-red-500 hover:bg-gray-700 hover:text-red-600"
                      onClick={() => handleDelete(group.id)}
                    >
                      <Trash className="mr-2 size-4" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
