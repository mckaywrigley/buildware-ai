"use client"

import { deleteIssue } from "@/db/queries/issue-queries"
import { SelectIssue } from "@/db/schema/issues-schema"
import { DataItem } from "../dashboard/reusable/data-item"
import { DataList } from "../dashboard/reusable/data-list"

interface IssuesListProps {
  issues: SelectIssue[]
  projectId: string
}

export function IssuesList({ issues, projectId }: IssuesListProps) {
  const handleIssueDelete = async (id: string) => {
    await deleteIssue(id)
  }

  return (
    <DataList
      title="Issues"
      subtitle="Manage issues"
      readMoreLink="#"
      readMoreText="Read more"
      createLink={`./issues/create`}
      createText="Create issue"
      description="Issue description here"
      dataListTitle="Issues"
    >
      {issues.length > 0 ? (
        issues.map(issue => (
          <DataItem
            key={issue.id}
            data={{ id: issue.id, title: issue.name }}
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