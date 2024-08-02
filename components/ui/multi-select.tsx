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
}

export function MultiSelect({
  label,
  data,
  selectedIds,
  onToggleSelect
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleToggleSelect = async (id: string) => {
    onToggleSelect(
      selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id]
    )
  }

  return (
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
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${label}...`} />
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
  )
}
