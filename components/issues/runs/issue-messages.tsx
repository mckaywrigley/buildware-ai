import { MessageMarkdown } from "@/components/instructions/message-markdown"
import {
  CircleDot,
  Cpu,
  CirclePlus,
  List,
  ListChecks,
  ChevronsLeftRight,
  DiamondPlus,
  Check
} from "lucide-react"

const messages = [
  { text: "Started", icon: <CircleDot className="mr-2 size-4" /> },
  { text: "Embedding", icon: <Cpu className="mr-2 size-4" /> },
  { text: "Retrieval", icon: <CirclePlus className="mr-2 size-4" /> },
  { text: "Think", icon: <List className="mr-2 size-4" /> },
  { text: "Plan", icon: <ListChecks className="mr-2 size-4" /> },
  { text: "Act", icon: <ChevronsLeftRight className="mr-2 size-4" /> },
  { text: "PR", icon: <DiamondPlus className="mr-2 size-4" /> },
  { text: "Completed", icon: <Check className="mr-2 size-4" /> }
]

export const IssueMessages = () => (
  <div className="col-span-1 border-r p-6">
    <div className="bg-secondary rounded-lg p-4">
      {messages.map(({ text, icon }, index) => (
        <div key={index}>
          <div className="flex items-center py-2">
            {icon}
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
