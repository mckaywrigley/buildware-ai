"use client"

import { deleteContextGroup, getContextGroup, getFilesInContextGroup, removeFileFromContextGroup } from "@/actions/context-groups"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SelectContextGroup, SelectContextGroupFile } from "@/db/schema/context-groups-schema"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FileSelector } from "./FileSelector"

export function ContextGroupDetail({ groupId }: { groupId: string }) {
  const [contextGroup, setContextGroup] = useState<SelectContextGroup | null>(null)
  const [files, setFiles] = useState<SelectContextGroupFile[]>([])
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  useEffect(() => {
    const fetchContextGroup = async () => {
      try {
        const group = await getContextGroup(groupId)
        setContextGroup(group)
        const groupFiles = await getFilesInContextGroup(groupId)
        setFiles(groupFiles)
      } catch (error) {
        console.error("Error fetching context group:", error)
      }
    }

    fetchContextGroup()
  }, [groupId])

  const handleDelete = async () => {
    try {
      await deleteContextGroup(groupId)
      router.push(`/${params.workspaceId}/${projectId}/context-groups`)
    } catch (error) {
      console.error("Error deleting context group:", error)
    }
  }

  const handleRemoveFile = async (filePath: string) => {
    try {
      await removeFileFromContextGroup(groupId, filePath)
      setFiles(files.filter(file => file.filePath !== filePath))
    } catch (error) {
      console.error("Error removing file from context group:", error)
    }
  }

  if (!contextGroup) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{contextGroup.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{contextGroup.description}</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Files</h3>
          <ul className="mt-2 space-y-2">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between">
                <span>{file.filePath}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file.filePath)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <FileSelector contextGroupId={groupId} onFileAdded={(newFile) => setFiles([...files, newFile])} />
        <div className="mt-4 space-x-2">
          <Link href={`/${params.workspaceId}/${projectId}/context-groups/${groupId}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </CardContent>
    </Card>
  )
}