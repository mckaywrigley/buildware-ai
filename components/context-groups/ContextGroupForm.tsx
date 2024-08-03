"use client"

import { createContextGroup, updateContextGroup } from "@/actions/context-groups"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

interface ContextGroupFormProps {
  contextGroup?: SelectContextGroup
  isEditing?: boolean
}

export function ContextGroupForm({ contextGroup, isEditing = false }: ContextGroupFormProps) {
  const [name, setName] = useState(contextGroup?.name || "")
  const [description, setDescription] = useState(contextGroup?.description || "")
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && contextGroup) {
        await updateContextGroup(contextGroup.id, { name, description })
      } else {
        await createContextGroup({ name, description, projectId })
      }
      router.push(`/${params.workspaceId}/${projectId}/context-groups`)
    } catch (error) {
      console.error("Error saving context group:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Context Group" : "Create New Context Group"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
        </form>
      </CardContent>
    </Card>
  )
}