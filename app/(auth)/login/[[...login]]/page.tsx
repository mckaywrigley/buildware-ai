import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  if (process.env.NEXT_PUBLIC_SIMPLE_MODE) {
    return null
  }

  return <SignIn />
}
