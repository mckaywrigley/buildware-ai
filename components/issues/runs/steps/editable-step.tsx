import { Button } from "@/components/ui/button"
import { AIThought } from "@/types/ai"
import { Plus, Trash2 } from "lucide-react"
import { FC, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { StepLoader } from "./step-loader"

interface EditableStepProps<T extends { number: number; text: string }> {
  items: T[]
  onUpdateItems: (updatedItems: T[]) => void
  title: string
  description: string
  itemName: string
  onNextStep: () => void
}

export const EditableStep: FC<EditableStepProps<AIThought>> = ({
  items,
  onUpdateItems,
  title,
  description,
  itemName,
  onNextStep
}) => {
  const [localItems, setLocalItems] = useState<AIThought[]>(items)

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

    const newItem: AIThought = {
      number: localItems.length + 1,
      text: ""
    }
    const updatedItems = [...localItems, newItem]
    setLocalItems(updatedItems)
    onUpdateItems(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    if (localItems.length === 1) return // Prevent removing the only item
    const updatedItems = localItems.filter((_, i) => i !== index)
    const renumberedItems = updatedItems.map((item, i) => ({
      ...item,
      number: i + 1
    }))
    setLocalItems(renumberedItems)
    onUpdateItems(renumberedItems)
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
        <div key={item.number} className="relative">
          <div className="bg-primary text-primary-foreground absolute -left-8 top-2 flex size-6 items-center justify-center rounded-full text-sm font-semibold">
            {item.number}
          </div>
          <ReactTextareaAutosize
            className="thought-text border-border bg-card focus:ring-primary w-full resize-none rounded-lg border p-4 pl-6 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2"
            value={item.text}
            onChange={e => handleItemChange(index, e.target.value)}
            minRows={2}
            maxRows={10}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-12 top-2"
            onClick={() => handleRemoveItem(index)}
            disabled={localItems.length === 1} // Disable button if it's the only item
          >
            <Trash2 className="size-4" />
          </Button>
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

      <Button variant="default" className="mt-4 w-full" onClick={onNextStep}>
        Confirm and Continue
      </Button>
    </div>
  )
}
