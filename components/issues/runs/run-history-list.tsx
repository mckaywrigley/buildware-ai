"use client"

import { SelectRun } from "@/db/schema/runs-schema"
import { useState } from "react"
import { ResumeRunButton } from "./resume-run-button"
import { formatDistanceToNow } from "date-fns"

interface RunHistoryListProps {
  runs: SelectRun[]
  issueId: string
}

export const RunHistoryList = ({ runs, issueId }: RunHistoryListProps) => {
  const [sortBy, setSortBy] = useState<"date" | "cost">("date")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in_progress">("all")

  const sortedRuns = [...runs].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return Number(b.totalCost) - Number(a.totalCost)
    }
  })

  const filteredRuns = sortedRuns.filter(run => {
    if (filterStatus === "all") return true
    return run.status === filterStatus
  })

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <div>
          <label className="mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "cost")}
            className="rounded border p-1"
          >
            <option value="date">Date</option>
            <option value="cost">Cost</option>
          </select>
        </div>
        <div>
          <label className="mr-2">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "completed" | "in_progress")}
            className="rounded border p-1"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </div>
      <ul className="space-y-4">
        {filteredRuns.map((run) => (
          <li key={run.id} className="rounded-lg border p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Run ID: {run.id}</p>
                <p>Status: {run.status}</p>
                <p>Total Cost: ${Number(run.totalCost).toFixed(2)}</p>
                <p>Created: {formatDistanceToNow(new Date(run.createdAt))} ago</p>
              </div>
              {run.status !== "completed" && (
                <ResumeRunButton runId={run.id} issueId={issueId} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}