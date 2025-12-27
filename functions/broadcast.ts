
import { inngest } from "@/lib/inngest/client"
import { createClient } from "@/lib/supabase/client" // Using client here but might need server utils if running in node env? Inngest functions run in API route which is node/edge. Supabase SSR recommended.
// Actually standard supabase-js client works if we use SERVICE_ROLE key for background jobs.
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Need a service role client to bypass RLS in background jobs
const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const sendBroadcastCampaign = inngest.createFunction(
    { id: "send-broadcast-campaign" },
    { event: "broadcast/start" },
    async ({ event, step }) => {
        const { campaignId } = event.data

        // Step 1: Fetch Campaign & Template
        const { campaign, template } = await step.run("fetch-campaign-data", async () => {
            const { data: campaign, error: cErr } = await supabaseAdmin
                .from('campaigns')
                .select('*')
                .eq('id', campaignId)
                .single()

            if (cErr || !campaign) throw new Error("Campaign not found")

            const { data: template, error: tErr } = await supabaseAdmin
                .from('templates')
                .select('*')
                .eq('id', campaign.template_id)
                .single()

            if (tErr || !template) throw new Error("Template not found")

            return { campaign, template }
        })

        // Step 2: Update status to SENDING
        await step.run("update-status-sending", async () => {
            await supabaseAdmin
                .from('campaigns')
                .update({ status: 'SENDING' })
                .eq('id', campaignId)
        })

        // Step 3: Fetch Audience (Chunking logic ideally done via cursor but here simple fetch all then chunk in memory for MVP, or better, step logic)
        // For MVP validation, fetch all contacts (assuming < 10k)
        // Ideally we filter by segments.
        const contacts = await step.run("fetch-audience", async () => {
            const { data } = await supabaseAdmin
                .from('contacts')
                .select('*')
                .eq('is_unsubscribed', false)
            return data || []
        })

        if (contacts.length === 0) {
            await step.run("finish-empty", async () => {
                await supabaseAdmin.from('campaigns').update({ status: 'COMPLETED' }).eq('id', campaignId)
            })
            return { success: true, count: 0 }
        }

        // Step 4: Chunk and Send
        const content = template.components // We need to parse this to replace variables. 
        // Simplified: Just body text variable replacement.

        const chunkSize = 50
        const chunks: any[][] = []
        for (let i = 0; i < contacts.length; i += chunkSize) {
            chunks.push(contacts.slice(i, i + chunkSize))
        }

        let successCount = 0

        for (const chunk of chunks) {
            await step.run(`process-chunk-${chunks.indexOf(chunk)}`, async () => {
                const promises = chunk.map(async (contact: any) => {
                    // 1. Prepare Payload
                    const body = {
                        messaging_product: "whatsapp",
                        to: contact.phone.replace('+', ''), // Meta requires no plus usually? actually yes, no plus.
                        type: "template",
                        template: {
                            name: template.name,
                            language: { code: template.language },
                            components: [
                                {
                                    type: "body",
                                    parameters: [
                                        { type: "text", text: contact.name || "Customer" } // {{1}} mapped to name
                                    ]
                                }
                            ]
                        }
                    }

                    // 2. Send to Meta
                    try {
                        const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.META_PHONE_NUMBER_ID}/messages`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(body)
                        })

                        const data = await res.json()

                        // 3. Log
                        if (res.ok) {
                            // Insert log
                            await supabaseAdmin.from('campaign_logs').insert({
                                campaign_id: campaignId,
                                contact_id: contact.id,
                                meta_message_id: data.messages?.[0]?.id,
                                status: 'sent'
                            })
                            return true
                        } else {
                            await supabaseAdmin.from('campaign_logs').insert({
                                campaign_id: campaignId,
                                contact_id: contact.id,
                                status: 'failed',
                                error_reason: JSON.stringify(data)
                            })
                            return false
                        }
                    } catch (e: any) {
                        return false
                    }
                })

                const results = await Promise.all(promises)
                successCount += results.filter(Boolean).length
            })

            // Sleep to respect rate limits
            await step.sleep("2s")
        }

        // Step 5: Finish
        await step.run("finish-campaign", async () => {
            await supabaseAdmin
                .from('campaigns')
                .update({
                    status: 'COMPLETED',
                    success_count: successCount,
                    total_audience: contacts.length
                })
                .eq('id', campaignId)
        })

        return { success: true, total: contacts.length, sent: successCount }
    }
)
