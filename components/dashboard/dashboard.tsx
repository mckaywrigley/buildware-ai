"use client"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SelectProject, SelectWorkspace } from "@/db/schema"
import { cn } from "@/lib/utils"
import { UserButton } from "@clerk/nextjs"
import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  Menu,
  Pencil,
  Settings,
  StickyNote
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FC, useState } from "react"
import { CreateProjectButton } from "../projects/create-project-button"
import { ThemeSwitcher } from "../utility/theme-switcher"
import { WorkspaceSelect } from "../workspaces/workspace-select"

type IntegrationStatus = {
  isGitHubConnected: boolean
  isLinearConnected: boolean
}

interface DashboardProps {
  children: React.ReactNode
  IntegrationStatus: IntegrationStatus
  workspaces: SelectWorkspace[]
  workspaceId: string
  projectId: string
  projects: SelectProject[]
}

const PROJECT_LINKS = [
  {
    label: "Issues",
    href: (workspaceId: string, projectId: string) =>
      `/${workspaceId}/${projectId}/issues`,
    icon: CircleDot
  },
  {
    label: "Templates",
    href: (workspaceId: string, projectId: string) =>
      `/${workspaceId}/${projectId}/templates`,
    icon: StickyNote
  },
  {
    label: "Instructions",
    href: (workspaceId: string, projectId: string) =>
      `/${workspaceId}/${projectId}/instructions`,
    icon: Pencil
  },
  {
    label: "Settings",
    href: (workspaceId: string, projectId: string) =>
      `/${workspaceId}/${projectId}/settings`,
    icon: Settings
  }
]

export const Dashboard: FC<DashboardProps> = ({
  children,
  workspaces,
  workspaceId,
  projects
}) => {
  const pathname = usePathname()
  const [openProjects, setOpenProjects] = useState<string[]>([])

  const toggleProject = (projectId: string) => {
    setOpenProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const filteredProjectLinks = PROJECT_LINKS.map(link => ({
    ...link,
    href: (workspaceId: string, projectId: string) =>
      `/${workspaceId}/${projectId}${link.href("", "")}`
  }))

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* BEGIN DESKTOP  */}
      <div className="bg-background hidden border-r md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="l flex h-14 items-center border-b px-2 lg:h-[60px]">
            <WorkspaceSelect workspaces={workspaces} />
          </div>

          <div className="px-4">
            <div className="flex items-center justify-between py-2">
              <div className="text-muted-foreground text-xs font-semibold">
                Your Projects
              </div>

              <CreateProjectButton params={{ workspaceId }} />
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid items-start gap-1">
                {projects.map(project => (
                  <Collapsible
                    key={project.id}
                    open={openProjects.includes(project.id)}
                    onOpenChange={() => toggleProject(project.id)}
                  >
                    <CollapsibleTrigger className="hover:bg-secondary/80 flex w-full items-center justify-between rounded px-2 py-1 text-sm font-semibold">
                      <span>{project.name}</span>

                      {openProjects.includes(project.id) ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </CollapsibleTrigger>

                    <CollapsibleContent className="ml-2 mt-1 flex flex-col gap-1 font-medium">
                      {filteredProjectLinks.map(link => (
                        <Link
                          key={link.href(workspaceId, project.id)}
                          className={cn(
                            `hover:bg-secondary/80 flex items-center gap-2.5 rounded-lg px-2 py-1 text-sm transition-all`,
                            pathname.includes(project.id) &&
                              pathname.includes(link.label.toLowerCase())
                              ? "bg-secondary/80 rounded"
                              : ""
                          )}
                          href={link.href(workspaceId, project.id)}
                        >
                          <link.icon className="size-4" />

                          {link.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto border-t p-4">
            <div className="flex items-center justify-between truncate">
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_APP_MODE === "simple" ? (
                  <div className="truncate font-light">Simple Mode</div>
                ) : (
                  <>
                    <UserButton />
                    <div className="truncate font-light">Advanced Mode</div>
                  </>
                )}
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
      {/* END DESKTOP  */}

      {/* BEGIN MOBILE  */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <div className="grid gap-4 py-4">
            {projects.map(project => (
              <Collapsible
                key={project.id}
                open={openProjects.includes(project.id)}
                onOpenChange={() => toggleProject(project.id)}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                  <span>{project.name}</span>

                  {openProjects.includes(project.id) ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent>
                  {filteredProjectLinks.map(link => (
                    <Link
                      key={link.href(workspaceId, project.id)}
                      href={link.href(workspaceId, project.id)}
                      className="block py-2 pl-4"
                    >
                      {link.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      {/* END MOBILE  */}

      <main className="bg-secondary/50 flex max-h-screen flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-6 lg:p-6">
        {children}
      </main>

      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <CreateProjectButton params={{ workspaceId }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
