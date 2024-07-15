"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SelectProject } from "@/db/schema"
import { cn } from "@/lib/utils"
import { UserButton, useUser } from "@clerk/nextjs"
import {
  CircleDot,
  Code,
  Menu,
  Pencil,
  Settings,
  StickyNote
} from "lucide-react"
import Link from "next/link"
import { redirect, usePathname } from "next/navigation"
import { FC } from "react"
import { ProjectSelect } from "../projects/project-select"
import { ThemeSwitcher } from "../utility/theme-switcher"

type IntegrationStatus = {
  isGitHubConnected: boolean
  isLinearConnected: boolean
}

interface DashboardProps {
  children: React.ReactNode
  IntegrationStatus: IntegrationStatus
  projects: SelectProject[]
  projectId: string
}

const DASHBOARD_LINKS = [
  {
    label: "Issues",
    href: (projectId: string) => `/${projectId}/issues`,
    icon: CircleDot
  },
  {
    label: "Templates",
    href: (projectId: string) => `/${projectId}/templates`,
    icon: StickyNote
  },
  {
    label: "Prompts",
    href: (projectId: string) => `/${projectId}/prompts`,
    icon: Pencil
  },
  {
    label: "Embeddings",
    href: (projectId: string) => `/${projectId}/embeddings`,
    icon: Code
  },
  // {
  //   label: "Repos",
  //   href: (projectId: string) => `/${projectId}/repos`,
  //   icon: Github
  // },
  {
    label: "Settings",
    href: (projectId: string) => `/${projectId}/setup`,
    icon: Settings
  }
]

export const Dashboard: FC<DashboardProps> = ({
  children,
  IntegrationStatus,
  projects,
  projectId
}) => {
  const pathname = usePathname()
  const user = useUser()

  const { isGitHubConnected, isLinearConnected } = IntegrationStatus

  const project = projects.find(p => p.id === projectId)

  if (!project?.hasSetup) {
    if (pathname.includes("setup")) {
      return <>{children}</>
    }

    return redirect(`/${projectId}/setup`)
  }

  const filteredDashboardLinks = DASHBOARD_LINKS.filter(link => {
    if (link.label === "Repos" && !isGitHubConnected) return false
    return true
  })

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* BEGIN DESKTOP  */}
      <div className="bg-background hidden border-r md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-2 lg:h-[60px] lg:px-4">
            <ProjectSelect projects={projects} />
          </div>

          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {filteredDashboardLinks.map(link => {
                return (
                  <Link
                    key={link.href(projectId)}
                    className={cn(
                      `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:opacity-50`,
                      pathname === link.href(projectId) &&
                        "bg-secondary rounded"
                    )}
                    href={link.href(projectId)}
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="mt-auto border-t p-4">
            <div className="flex items-center justify-between truncate">
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_APP_MODE === "basic" ? (
                  <div className="truncate font-light">Basic Mode</div>
                ) : (
                  <>
                    <UserButton />
                    {user.user && (
                      <div className="truncate font-light">
                        {user.user.firstName || "User Name Placeholder"}
                      </div>
                    )}
                  </>
                )}
              </div>

              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
      {/* END DESKTOP  */}

      <div className="flex flex-col">
        {/* BEGIN MOBILE  */}
        <header className="bg-muted/40 flex h-14 items-center gap-4 border-b px-4 md:hidden lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                {filteredDashboardLinks.map(link => {
                  return (
                    <Link
                      key={link.href(projectId)}
                      href={link.href(projectId)}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto">
                <UserButton />
              </div>
            </SheetContent>
          </Sheet>
        </header>
        {/* END MOBILE  */}

        <main className="bg-secondary/50 flex max-h-screen flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
