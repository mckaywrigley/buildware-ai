"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { FC, useState } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"

interface CRUDFormProps {
  itemName: string
  buttonText: string
  onSubmit: (formData: FormData) => Promise<void>
  data?: {
    title: string
    content: string
  }
}

export const CRUDForm: FC<CRUDFormProps> = ({
  itemName,
  buttonText,
  onSubmit,
  data
}) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsSubmitting(true)
    event.preventDefault()
    const form = event.currentTarget.closest("form")
    if (form) {
      const formData = new FormData(form)
      await onSubmit(formData)
    }
    setIsSubmitting(false)
  }

  return (
    <form className="flex flex-col gap-6">
      <Card>
        <CardContent className="bg-secondary/50 p-2">
          <Input
            className="border-none bg-transparent text-xl font-bold"
            name="title"
            placeholder={`${itemName} title`}
            defaultValue={data?.title}
          />

          <ReactTextareaAutosize
            className="w-full resize-none bg-transparent px-3 py-2 focus-visible:outline-none"
            name="content"
            rows={5}
            placeholder={`${itemName} content...`}
            minRows={5}
            defaultValue={data?.content}
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
            variant="create"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </form>
  )
}
