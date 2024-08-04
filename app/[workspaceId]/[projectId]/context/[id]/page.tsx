import { CRUDPage } from "@/components/dashboard/reusable/crud-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getContextGroupById } from "@/db/queries/context-groups-queries"
import { getEmbeddedFilesForContextGroup } from "@/db/queries/context-groups-to-embedded-files-queries"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const revalidate = 0

export default async function ContextGroupPage({
  params
}: {
  params: { id: string }
}) {
  const contextGroup = await getContextGroupById(params.id)

  if (!contextGroup) {
    notFound()
  }

  const embeddedFiles = await getEmbeddedFilesForContextGroup(contextGroup.id)

  return (
    <CRUDPage
      pageTitle={contextGroup.name}
      backText="Back to context groups"
      backLink="../context"
    >
      <div className="mb-6 flex justify-end">
        <Link href={`./${params.id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 size-4" />
            Edit context group
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 text-xl font-semibold">Attached Files</div>
          {embeddedFiles.length > 0 ? (
            <div className="space-y-2">
              {embeddedFiles.map(file => (
                <div
                  key={file.embeddedFileId}
                  className="bg-secondary/50 rounded p-2"
                >
                  {file.embeddedFile.path}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No files attached</div>
          )}
        </CardContent>
      </Card>
    </CRUDPage>
  )
}
