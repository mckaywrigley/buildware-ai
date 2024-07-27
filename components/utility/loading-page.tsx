import { Loader2 } from "lucide-react"

interface LoadingPageProps {
  size?: number
}

export const LoadingPage = ({ size = 16 }: LoadingPageProps) => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className={`size-${size} animate-spin`} />
    </div>
  )
}
