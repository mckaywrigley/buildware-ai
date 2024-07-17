"use client"

import Link from "next/link"
import { FC, ReactNode } from "react"
import { Button } from "../../ui/button"

interface DataListProps {
  title: string
  subtitle: string
  readMoreLink: string
  readMoreText: string
  createLink: string
  createText: string
  dataListTitle: string
  children: ReactNode
}

export const DataList: FC<DataListProps> = ({
  title,
  subtitle,
  readMoreLink,
  readMoreText,
  createLink,
  createText,
  dataListTitle,
  children
}) => {
  return (
    <div className="text-primary mx-auto w-full max-w-[800px] p-6">
      <div className="mb-2 text-2xl font-bold">{title}</div>

      <div className="text-muted-foreground mb-4 text-sm">{subtitle}</div>

      <div className="flex flex-col gap-2">
        <Link
          href={readMoreLink}
          target="_blank"
          className="text-sm text-blue-500"
        >
          {readMoreText} →
        </Link>
      </div>

      <div className="bg-primary/20 my-6 h-px" />

      <div className="my-6 flex items-center justify-between">
        <div className="text-lg font-semibold">{dataListTitle}</div>

        <Link href={createLink}>
          <Button variant="create">{createText}</Button>
        </Link>
      </div>

      <div className="space-y-2">{children}</div>
    </div>
  )
}
