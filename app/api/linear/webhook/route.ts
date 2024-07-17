import { handleWebhook } from "@/actions/linear/webhook"
import { getWorkspaceByLinearOrganizationId } from "@/db/queries"
import { LinearWebhookBody } from "@/types/linear/linear"
import { LinearClient } from "@linear/sdk"
import crypto from "crypto"

export async function POST(req: Request) {
  const body = await req.json()

  if (!isValidSignature(req, body)) {
    return new Response("Invalid signature", { status: 400 })
  }

  const { actor, organizationId } = body as LinearWebhookBody
  const workspace = await getWorkspaceByLinearOrganizationId(organizationId)

  if (!workspace?.linearAccessToken) {
    console.error("Profile or Linear access token not found", actor.id)
    return new Response("Profile or Linear access token not found", {
      status: 400
    })
  }

  const linearClient = new LinearClient({ apiKey: workspace.linearAccessToken })

  try {
    await handleWebhook(linearClient, body)
    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

const isValidSignature = (req: Request, body: any): boolean => {
  const signature = crypto
    .createHmac("sha256", process.env.LINEAR_WEBHOOK_SECRET!)
    .update(JSON.stringify(body))
    .digest("hex")

  const linearSignature = req.headers.get("linear-signature")
  return signature === linearSignature
}
