import { Loader2 } from "lucide-react"
import { FC } from "react"

interface LoadingPageProps {
  size?: number
}

export const LoadingPage: FC<LoadingPageProps> = ({ size = 16 }) => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className={`size-${size} animate-spin`} />
    </div>
  )
}
