import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  if (process.env.NEXT_PUBLIC_SIMPLE_MODE) {
    return null
  }

  return <SignUp />
}
