"use client"

import { getContextGroups } from "@/actions/context-groups"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export function ContextGroupsList() {
  const [contextGroups, setContextGroups] = useState<SelectContextGroup[]>([])
  const params = useParams()
  const projectId = params.projectId as string

  useEffect(() => {
    const fetchContextGroups = async () => {
      try {
        const groups = await getContextGroups(projectId)
        setContextGroups(groups)
      } catch (error) {
        console.error("Error fetching context groups:", error)
      }
    }

    fetchContextGroups()
  }, [projectId])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Context Groups</h2>
        <Link href={`/${params.workspaceId}/${projectId}/context-groups/new`}>
          <Button>Create New Group</Button>
        </Link>
      </div>
      {contextGroups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{group.description}</p>
            <Link href={`/${params.workspaceId}/${projectId}/context-groups/${group.id}`}>
              <Button variant="outline" className="mt-2">View Details</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}