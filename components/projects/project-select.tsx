"use client"

import { SelectProject } from "@/db/schema/projects-schema"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { FC, HTMLAttributes, useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CreateProjectButton } from "./create-project-button"

interface ProjectSelectProps extends HTMLAttributes<HTMLDivElement> {
  projects: SelectProject[]
}

export const ProjectSelect: FC<ProjectSelectProps> = ({ projects }) => {
  const projectValues = projects.map(project => ({
    value: project.id,
    label: project.name
  }))

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const projectId = params.projectId as string

  useEffect(() => {
    setValue(projectId)
  }, [projectId])

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
          >
            <div className="truncate font-bold">
              {value
                ? projectValues.find(project => project.value === value)?.label
                : "Select project..."}
            </div>
            <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search project..." />
            <CommandList>
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup>
                {projectValues.map(project => (
                  <CommandItem
                    key={project.value}
                    value={project.value}
                    onSelect={currentValue => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                      router.push(`/${currentValue}`)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === project.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="truncate">{project.label}</div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>

            <CreateProjectButton className="w-full p-2" />
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
