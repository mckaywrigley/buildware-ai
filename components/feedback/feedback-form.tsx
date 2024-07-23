"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createFeedback } from "@/db/queries/feedback-queries"

interface FeedbackFormProps {
  onFeedbackSubmitted: () => void
}

export function FeedbackForm({ onFeedbackSubmitted }: FeedbackFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await createFeedback({ content })
      setContent("")
      onFeedbackSubmitted()
    } catch (err) {
      setError("An error occurred while submitting your feedback. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your feedback here..."
        required
        className="min-h-[150px]"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  )
}