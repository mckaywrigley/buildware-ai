"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"

interface CRUDFormProps {
  itemName: string
  buttonText: string
  onSubmit: (formData: FormData) => Promise<void>
  data?: {
    name: string
    content: string
  }
  onContentChange?: (content: string) => void
  onNameChange?: (name: string) => void
}

export const CRUDForm = ({
  itemName,
  buttonText,
  onSubmit,
  data,
  onContentChange,
  onNameChange
}: CRUDFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(data?.name || "")
  const [content, setContent] = useState(data?.content || "")

  const isFormValid = name.trim() !== "" && content.trim() !== ""

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isFormValid) return

    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    await onSubmit(formData)
    setIsSubmitting(false)
  }

  useEffect(() => {
    setName(data?.name || "")
    setContent(data?.content || "")
  }, [data?.name, data?.content])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardContent className="bg-secondary/50 p-2">
          <Input
            className="border-none bg-transparent text-xl font-bold"
            name="name"
            placeholder={`${itemName} name`}
            value={name}
            onChange={e => {
              setName(e.target.value)
              onNameChange?.(e.target.value)
            }}
            required
          />

          <ReactTextareaAutosize
            className="w-full resize-none bg-transparent px-3 py-2 focus-visible:outline-none"
            name="content"
            rows={5}
            placeholder={`${itemName} content...`}
            minRows={5}
            value={content}
            onChange={e => {
              setContent(e.target.value)
              onContentChange?.(e.target.value)
            }}
            required
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="ml-auto space-x-2">
          <Button
            type="button"
            className="bg-secondary hover:bg-secondary/80"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="create"
            disabled={isSubmitting || !isFormValid}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </form>
  )
}
