"use client"

import { deleteContextGroup } from "@/db/queries/context-groups-queries"
import { SelectContextGroup } from "@/db/schema/context-groups-schema"
import { DataItem } from "../dashboard/reusable/data-item"
import { DataList } from "../dashboard/reusable/data-list"

interface ContextGroupsListProps {
  contextGroups: SelectContextGroup[]
}

export function ContextGroupsList({ contextGroups }: ContextGroupsListProps) {
  const handleContextGroupDelete = async (id: string) => {
    await deleteContextGroup(id)
  }

  return (
    <DataList
      title="Context Groups"
      subtitle="Manage context groups"
      readMoreLink="https://docs.buildware.ai/core-components/context-groups"
      readMoreText="Read more"
      createLink="./context/create"
      createText="Create context group"
      dataListTitle="Context Groups"
    >
      {contextGroups.length > 0 ? (
        contextGroups.map(group => (
          <DataItem
            key={group.id}
            data={{ id: group.id, name: group.name }}
            type="context"
            onDelete={handleContextGroupDelete}
          />
        ))
      ) : (
        <div>No context groups found.</div>
      )}
    </DataList>
  )
}
