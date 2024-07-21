import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FC, HTMLAttributes, ReactNode } from "react"

interface CRUDPageProps extends HTMLAttributes<HTMLDivElement> {
  pageTitle: string
  backText: string
  backLink: string
  children: ReactNode
}

export const CRUDPage: FC<CRUDPageProps> = ({
  pageTitle,
  backText,
  backLink,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "text-primary mx-auto w-full max-w-[800px] p-6",
        props.className
      )}
    >
      <Link
        href={backLink}
        className="text-muted-foreground hover:text-primary flex items-center"
      >
        <ArrowLeft className="mr-2 size-4" />
        {backText}
      </Link>

      <div className="mt-4 text-2xl font-bold">{pageTitle}</div>

      <div className="bg-primary/20 my-8 h-px" />

      <div>{children}</div>
    </div>
  )
}
