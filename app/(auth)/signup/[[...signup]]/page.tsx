import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  if (process.env.NEXT_PUBLIC_APP_MODE === "basic") {
    return null
  }

  return <SignUp />
}
