import { updateWorkspace } from "@/db/queries"
import { LinearClient } from "@linear/sdk"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    return new Response(JSON.stringify({ error: "Invalid OAuth callback" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  const headersList = headers()
  const host = headersList.get("host") || ""
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
  const origin = `${protocol}://${host}`

  const { workspaceId } = JSON.parse(decodeURIComponent(state))

  try {
    const tokenResponse = await fetch("https://api.linear.app/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        redirect_uri: `${origin}/api/auth/callback/linear`,
        client_id: process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID!,
        client_secret: process.env.LINEAR_CLIENT_SECRET!,
        grant_type: "authorization_code"
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Linear token exchange error:", errorData)
      throw new Error(
        `Failed to exchange code for token: ${tokenResponse.status} ${tokenResponse.statusText}`
      )
    }

    const { access_token } = await tokenResponse.json()

    const linearClient = new LinearClient({
      apiKey: access_token
    })

    const organization = await linearClient.organization

    await updateWorkspace(workspaceId, {
      linearOrganizationId: organization.id,
      linearAccessToken: access_token
    })

    revalidatePath(`/`)
  } catch (error) {
    console.error("Error during Linear OAuth:", error)
  }

  return redirect(`/${workspaceId}/settings`)
}
