"use client"

import { getContextGroups } from "@/actions/context-groups/get-context-groups"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import Link from "next/link"
import { useEffect, useState } from "react"

export function ContextGroupList({ projectId }: { projectId: string }) {
  const [contextGroups, setContextGroups] = useState<SelectContextGroup[]>([])

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
        <Link href={`/${projectId}/context-groups/create`}>
          <Button>Create Context Group</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contextGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{group.description}</p>
              <Link href={`/${projectId}/context-groups/${group.id}`}>
                <Button className="mt-4" variant="outline">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}