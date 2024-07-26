import { MessageMarkdown } from "@/components/instructions/message-markdown"
import {
  Check,
  ChevronsLeftRight,
  CircleDot,
  CirclePlus,
  Cpu,
  DiamondPlus,
  List,
  ListChecks
} from "lucide-react"

const messages = [
  { text: "Started", icon: <CircleDot className="size-4" /> },
  { text: "Embedding", icon: <Cpu className="size-4" /> },
  { text: "Retrieval", icon: <CirclePlus className="size-4" /> },
  { text: "Think", icon: <List className="size-4" /> },
  { text: "Plan", icon: <ListChecks className="size-4" /> },
  { text: "Act", icon: <ChevronsLeftRight className="size-4" /> },
  { text: "PR", icon: <DiamondPlus className="size-4" /> },
  { text: "Completed", icon: <Check className="size-4" /> }
]

export const IssueMessages = () => (
  <div className="col-span-1 border-r p-6">
    <div className="bg-secondary rounded-lg p-4">
      {messages.map(({ text, icon }, index) => (
        <div key={index}>
          <div className="flex items-center py-2">
            <div className="mr-2">{icon}</div>
            <MessageMarkdown content={text} />
          </div>
          {index < messages.length - 1 && (
            <div className="my-2 border-t border-zinc-700" />
          )}
        </div>
      ))}
    </div>
  </div>
)
