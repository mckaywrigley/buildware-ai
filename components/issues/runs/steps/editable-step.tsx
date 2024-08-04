import { MessageMarkdown } from "@/components/instructions/message-markdown"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { PlanStep } from "@/types/run"
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { StepLoader } from "./step-loader"

interface EditableStepProps<T extends { text: string }> {
  items: T[]
  onUpdateItems: (updatedItems: T[]) => void
  title: string
  description: string
  itemName: string
}

export const EditableStep = ({
  items,
  onUpdateItems,
  title,
  description,
  itemName
}: EditableStepProps<PlanStep>) => {
  const [localItems, setLocalItems] = useState<PlanStep[]>(items)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const handleItemChange = (index: number, newText: string) => {
    const updatedItems = localItems.map((item, i) =>
      i === index ? { ...item, text: newText } : item
    )
    setLocalItems(updatedItems)
    onUpdateItems(updatedItems)
  }

  const handleAddItem = () => {
    if (
      localItems.length > 0 &&
      localItems[localItems.length - 1].text.trim() === ""
    ) {
      return // Don't add a new item if the last one is empty
    }

    const newItem: PlanStep = {
      text: ""
    }
    const updatedItems = [...localItems, newItem]
    setLocalItems(updatedItems)
    onUpdateItems(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    if (localItems.length === 1) return // Prevent removing the only item
    const updatedItems = localItems.filter((_, i) => i !== index)
    setLocalItems(updatedItems)
    onUpdateItems(updatedItems)
  }

  const handleEditItem = (index: number) => {
    setEditingIndex(index)
  }

  const handleSaveItem = () => {
    setEditingIndex(null)
    onUpdateItems(localItems)
  }

  if (localItems.length === 0) {
    return <StepLoader text={`Generating ${itemName}s...`} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">{title}</div>
        <div>{description}</div>
      </div>

      {localItems.map((item, index) => (
        <div key={index} className="relative pt-6">
          <div className="absolute -top-2 right-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-secondary mr-2 w-40 border p-2">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    className="hover:bg-secondary-foreground/10 justify-start"
                    onClick={() => handleEditItem(index)}
                  >
                    <Edit className="mr-2 size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="hover:bg-secondary-foreground/10 justify-start text-red-500"
                    onClick={() => handleRemoveItem(index)}
                    disabled={localItems.length === 1}
                  >
                    <Trash2 className="mr-2 size-4 text-red-500" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {editingIndex === index ? (
            <>
              <ReactTextareaAutosize
                className="thought-text border-border bg-card focus:ring-primary w-full resize-none rounded-lg border p-4 pl-6 pr-10 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2"
                value={item.text}
                onChange={e => handleItemChange(index, e.target.value)}
                minRows={2}
                maxRows={10}
              />
              <Button
                variant="outline"
                className="mt-2"
                onClick={handleSaveItem}
              >
                Save
              </Button>
            </>
          ) : (
            <div className="thought-text border-border bg-card w-full rounded-lg border p-4 pl-6 pr-10 shadow-sm">
              <MessageMarkdown content={item.text} />
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        className="mt-2 w-full"
        onClick={handleAddItem}
        disabled={
          localItems.length > 0 &&
          localItems[localItems.length - 1].text.trim() === ""
        }
      >
        <Plus className="mr-2 size-4" />
        Add {itemName}
      </Button>
    </div>
  )
}
