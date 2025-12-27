
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// NOTE: Moved client initialization inside handler to separate concern and prevent build time crash if envs missing.

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
        return new NextResponse(challenge)
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function POST(request: Request) {
    // Lazy initialize inside handler
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const body = await request.json()

        // Check if this is an event from a WhatsApp Business Account
        if (body.object === "whatsapp_business_account") {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    const value = change.value

                    // Case 1: Message Status Update (sent, delivered, read)
                    if (value.statuses) {
                        for (const status of value.statuses) {
                            const metaMessageId = status.id
                            const statusState = status.status

                            await supabaseAdmin
                                .from('campaign_logs')
                                .update({
                                    status: statusState,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('meta_message_id', metaMessageId)
                        }
                    }

                    // Case 2: Incoming Messages (Unsubscribes)
                    if (value.messages) {
                        for (const message of value.messages) {
                            const from = message.from // e.g., 919999999999
                            const text = message.text?.body?.toLowerCase()

                            if (text && (text === 'stop' || text === 'unsubscribe' || text === 'remove' || text === 'opt out')) {
                                // Update contact
                                const phoneWithPlus = '+' + from

                                await supabaseAdmin
                                    .from('contacts')
                                    .update({ is_unsubscribed: true })
                                    .eq('phone', phoneWithPlus)

                                // Reply (Optional - Meta charges for this if not within 24h window of user init)
                                await fetch(`https://graph.facebook.com/v21.0/${process.env.META_PHONE_NUMBER_ID}/messages`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        messaging_product: "whatsapp",
                                        to: from,
                                        type: "text",
                                        text: { body: "You have been unsubscribed from MVP Daddy Connect updates." }
                                    })
                                })
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
