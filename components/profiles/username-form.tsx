"use client"

import { updateUsername } from "@/actions/profiles/update-username"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface UsernameFormProps {
  initialUsername: string
}

export function UsernameForm({ initialUsername }: UsernameFormProps) {
  const [username, setUsername] = useState(initialUsername)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateUsername(username)
      toast.success("Username updated successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update username")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={20}
          className="mt-1"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || username === initialUsername}>
          {isSubmitting ? "Updating..." : "Update Username"}
        </Button>
      </div>
    </form>
  )
}