"use client"

import { useSearchParams } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { ConnectGitHub } from "./connect-github"
import { ConnectLinear } from "./connect-linear"

interface IntegrationsProps {
  isGitHubConnected: boolean
  isLinearConnected: boolean
}

export const Integrations: FC<IntegrationsProps> = ({
  isGitHubConnected,
  isLinearConnected
}) => {
  const searchParams = useSearchParams()

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }

    const successParam = searchParams.get("success")
    if (successParam) {
      setSuccess(decodeURIComponent(successParam))
    }
  }, [searchParams])

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold">Integrations</div>

      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">{success}</div>}

      <div className="flex max-w-[300px] flex-col gap-4">
        <ConnectGitHub isGitHubConnected={isGitHubConnected} />
       
        <ConnectLinear isLinearConnected={isLinearConnected} />
      </div>
    </div>
  )
}
