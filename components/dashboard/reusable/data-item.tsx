"use client"

import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import Link from "next/link"
import { FC } from "react"
import { Button } from "../../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Separator } from "../../ui/separator"

interface DataItemProps {
  data: {
    id: string
    name: string
  }
  type: "instructions" | "templates" | "issues"
  onDelete: (id: string) => Promise<void>
}

export const DataItem: FC<DataItemProps> = ({ data, type, onDelete }) => {
  return (
    <div className="bg-secondary border-primary/20 group relative rounded border p-4">
      <Link
        href={`./${type}/${data.id}`}
        className="text-primary block hover:text-gray-300"
      >
        <div className="font-semibold">{data.name}</div>
      </Link>

      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Link href={`./${type}/${data.id}/edit`}>
          <Pencil className="text-primary/30 size-4 cursor-pointer hover:text-white" />
        </Link>

        <Popover>
          <PopoverTrigger>
            <MoreHorizontal className="text-primary/30 size-4 cursor-pointer hover:text-white" />
          </PopoverTrigger>

          <PopoverContent className="bg-secondary border-primary/20 w-[300px] rounded border p-4">
            <div className="flex flex-col space-y-2">
              <Link href={`./${type}/${data.id}/edit`}>
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
                onClick={() => onDelete(data.id)}
              >
                <Trash className="mr-2 size-4" />
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
