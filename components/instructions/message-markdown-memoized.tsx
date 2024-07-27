import { memo } from "react"
import ReactMarkdown from "react-markdown"

export const MessageMarkdownMemoized = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
)
