import { FC } from "react"

interface EditFormProps {
  action: (formData: FormData) => Promise<void>
  children: React.ReactNode
}

export const EditForm: FC<EditFormProps> = ({ action, children }) => {
  return (
    <form className="flex max-w-[600px] flex-col gap-4" action={action}>
      {children}
    </form>
  )
}
