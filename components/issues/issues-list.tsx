"use client"

import { deleteIssue } from "@/db/queries/issues-queries"
import { SelectIssue } from "@/db/schema/issues-schema"
import { DataItem } from "../dashboard/reusable/data-item"
import { DataList } from "../dashboard/reusable/data-list"

interface IssuesListProps {
  issues: SelectIssue[]
}

export function IssuesList({ issues }: IssuesListProps) {
  const handleIssueDelete = async (id: string) => {
    await deleteIssue(id)
  }

  return (
    <DataList
      title="Issues"
      subtitle="Manage issues"
      readMoreLink="https://docs.buildware.ai/core-components/issues"
      readMoreText="Read more"
      createLink={`./issues/create`}
      createText="Create issue"
      dataListTitle="Issues"
    >
      {issues.length > 0 ? (
        issues.map(issue => (
          <DataItem
            key={issue.id}
            data={{ id: issue.id, name: issue.name }}
            type="issues"
            onDelete={handleIssueDelete}
          />
        ))
      ) : (
        <div>No issues found.</div>
      )}
    </DataList>
  )
}
