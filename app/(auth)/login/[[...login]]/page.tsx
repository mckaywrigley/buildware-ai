import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  if (process.env.NEXT_PUBLIC_APP_MODE === "basic") {
    return null
  }

  return <SignIn />
}
