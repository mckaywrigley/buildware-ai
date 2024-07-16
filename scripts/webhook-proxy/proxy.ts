import dotenv from "dotenv"
import SmeeClient from "smee-client"

dotenv.config({ path: ".env.local" })

const port = process.env.PORT || 3000

const smee = new SmeeClient({
  source: process.env.WEBHOOK_URL!,
  target: `http://localhost:${port}/api/linear/webhook`, // LINEAR TEST
  logger: console
})

const events = smee.start()
//
