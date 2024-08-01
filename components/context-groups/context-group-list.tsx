import { Card, CardHeader, CardTitle } from "../ui/card"
import Link from "next/link"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"

interface ContextGroupListProps {
  contextGroups: SelectContextGroup[]
}

export const ContextGroupList: React.FC<ContextGroupListProps> = ({
  contextGroups
}) => {
  if (contextGroups.length === 0) {
    return <div>No context groups found.</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {contextGroups.map(group => (
        <Link key={group.id} href={`./context/${group.id}`}>
          <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
