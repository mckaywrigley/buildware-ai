import { FC } from "react"

interface NotFoundProps {
  message: string
}

export const NotFound: FC<NotFoundProps> = ({ message }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="text-4xl font-bold">{message}</div>
    </div>
  )
}
