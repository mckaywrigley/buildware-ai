"use client"

import { CircleDot } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { FC, useState } from "react"
import { Integration } from "./integration"

interface ConnectLinearProps {
  isLinearConnected: boolean
}

export const ConnectLinear: FC<ConnectLinearProps> = ({
  isLinearConnected
}) => {
  const router = useRouter()
  const params = useParams()

  const [isConnecting, setIsConnecting] = useState(false)

  const projectId = params.projectId as string

  const handleConnect = () => {
    try {
      if (!projectId) {
        throw new Error("User ID or project ID not found")
      }

      setIsConnecting(true)

      const state = JSON.stringify({ projectId })

      const clientId = process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID
      const redirectUri = encodeURIComponent(
        `${window.location.origin}/api/auth/callback/linear`
      )
      const scope = "read,write,issues:create,comments:create"
      const actor = "application"

      router.push(
        `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${encodeURIComponent(
          state
        )}&scope=${scope}&actor=${actor}`
      )
    } catch (error) {
      console.error("Linear connection error:", error)
      router.push(`/projects`)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Integration
      name="Linear"
      icon={<CircleDot className="size-5" />}
      isConnecting={isConnecting}
      isConnected={isLinearConnected}
      disabled={isConnecting || isLinearConnected}
      onClick={handleConnect}
    />
  )
}
