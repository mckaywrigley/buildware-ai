"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, File, Folder } from "lucide-react"
import { useState } from "react"

interface ContextMultiSelectProps {
  label: string
  data: {
    id: string
    name: string
    type: "file" | "folder"
    path: string
  }[]
  selectedIds: string[]
  onToggleSelect: (selectedIds: string[]) => void
}

export function ContextMultiSelect({
  label,
  data,
  selectedIds,
  onToggleSelect
}: ContextMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<
    "files" | "folders" | null
  >(null)

  const handleToggleSelect = (id: string) => {
    const item = data.find(item => item.id === id)
    if (!item) return
    if (item.type === "folder") {
      handleFolderSelect(id)
    } else {
      onToggleSelect(
        selectedIds.includes(id)
          ? selectedIds.filter(selectedId => selectedId !== id)
          : [...selectedIds, id]
      )
    }
  }

  const handleFolderSelect = (folderId: string) => {
    const folderPath = data.find(item => item.id === folderId)?.path || ""
    const affectedItems = data.filter(
      item => item.type === "file" && item.path.startsWith(folderPath)
    )
    const affectedIds = affectedItems.map(item => item.id)

    const allSelected = affectedIds.every(id => selectedIds.includes(id))
    const newSelectedIds = allSelected
      ? selectedIds.filter(id => !affectedIds.includes(id))
      : [...new Set([...selectedIds, ...affectedIds])]

    onToggleSelect(newSelectedIds)
  }

  const isFolderSelected = (folderId: string) => {
    const folderPath = data.find(item => item.id === folderId)?.path || ""
    const affectedItems = data.filter(
      item => item.type === "file" && item.path.startsWith(folderPath)
    )
    return affectedItems.every(item => selectedIds.includes(item.id))
  }

  const files = data.filter(item => item.type === "file")
  const folders = data.filter(item => item.type === "folder")

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : `Select ${label}...`}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[300px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />

            <CommandList>
              <CommandEmpty>No {label} found.</CommandEmpty>

              {selectedSection === null && (
                <CommandGroup>
                  <CommandItem onSelect={() => setSelectedSection("files")}>
                    Files
                  </CommandItem>
                  <CommandItem onSelect={() => setSelectedSection("folders")}>
                    Folders
                  </CommandItem>
                </CommandGroup>
              )}

              {selectedSection !== null && (
                <CommandGroup>
                  <CommandItem onSelect={() => setSelectedSection(null)}>
                    Back
                  </CommandItem>
                </CommandGroup>
              )}

              {selectedSection === "files" && (
                <CommandGroup>
                  {files.map(item => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleToggleSelect(item.id)}
                    >
                      <div className="flex items-center">
                        <File className="mr-2 size-4" />

                        <Check
                          className={cn(
                            "mr-2 size-4",
                            selectedIds.includes(item.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {item.name}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {selectedSection === "folders" && (
                <CommandGroup>
                  {folders.map(item => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleToggleSelect(item.id)}
                    >
                      <div className="flex items-center">
                        <Folder className="mr-2 size-4" />

                        <Check
                          className={cn(
                            "mr-2 size-4",
                            isFolderSelected(item.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />

                        {item.name}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>

          {selectedIds.length > 0 && (
            <div className="mt-2 max-h-[200px] overflow-y-auto p-2">
              {selectedIds.map(id => {
                const item = data.find(item => item.id === id)

                if (!item) return null

                const Icon = item.type === "file" ? File : Folder

                return (
                  <div
                    key={id}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="flex items-center">
                      <Icon className="mr-2 size-4" />
                      {item.name}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleSelect(id)}
                    >
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
