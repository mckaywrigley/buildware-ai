"use client"

import { useState } from "react"
import { FeedbackForm } from "@/components/feedback/feedback-form"
import { ThankYouDialog } from "@/components/feedback/thank-you-dialog"

export default function FeedbackPage() {
  const [isThankYouDialogOpen, setIsThankYouDialogOpen] = useState(false)

  const handleFeedbackSubmitted = () => {
    setIsThankYouDialogOpen(true)
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="mb-8 text-3xl font-bold">User Feedback</h1>
      <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
      <ThankYouDialog
        isOpen={isThankYouDialogOpen}
        onClose={() => setIsThankYouDialogOpen(false)}
      />
    </div>
  )
}