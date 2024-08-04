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
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

interface MultiSelectProps {
  label: string
  data: {
    id: string
    name: string
  }[]
  selectedIds: string[]
  onToggleSelect: (selectedIds: string[]) => void
  showSelectAll?: boolean
  showDeselectAll?: boolean
}

export function MultiSelect({
  label,
  data,
  selectedIds,
  onToggleSelect,
  showSelectAll = false,
  showDeselectAll = false
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleToggleSelect = (id: string) => {
    onToggleSelect(
      selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id]
    )
  }

  const handleSelectAll = () => {
    onToggleSelect(data.map(item => item.id))
  }

  const handleDeselectAll = () => {
    onToggleSelect([])
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedIds.length > 0
                ? `${selectedIds.length} ${label}${selectedIds.length > 1 ? "s" : ""} selected`
                : `Select ${label}s...`}
            </span>
            <div className="flex items-center gap-2">
              {selectedIds.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    handleDeselectAll()
                  }}
                  className="h-auto px-1.5 py-0.5 text-xs hover:cursor-pointer hover:opacity-50"
                >
                  Clear All
                </Button>
              )}
              <ChevronsUpDown className="size-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${label}s...`} />
            {showSelectAll && (
              <Button
                size="sm"
                variant="outline"
                className="m-1 w-[calc(100%-0.5rem)] text-xs"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
            )}
            <CommandList>
              <CommandEmpty>No {label} found.</CommandEmpty>
              <CommandGroup>
                {data.map(item => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleToggleSelect(item.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedIds.includes(item.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
