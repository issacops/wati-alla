
import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { sendBroadcastCampaign } from "@/functions/broadcast"

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        sendBroadcastCampaign,
    ],
})
