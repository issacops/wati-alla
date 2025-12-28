
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { META_ACCESS_TOKEN, META_WABA_ID } = process.env
    if (!META_ACCESS_TOKEN || !META_WABA_ID) {
        return NextResponse.json({ error: 'Missing Meta credentials' }, { status: 500 })
    }

    try {
        const response = await fetch(
            `https://graph.facebook.com/v21.0/${META_WABA_ID}/message_templates?limit=100`,
            {
                headers: {
                    Authorization: `Bearer ${META_ACCESS_TOKEN}`,
                },
            }
        )

        if (!response.ok) {
            const errorData = await response.json()
            return NextResponse.json({ error: 'Meta API error', details: errorData }, { status: response.status })
        }

        const data = await response.json()
        const templates = data.data

        const results: string[] = []

        for (const t of templates) {
            // Upsert into Supabase
            // Note: mapping 'id' from meta to 'meta_template_id'
            const { error } = await supabase.from('templates').upsert({
                meta_template_id: t.id,
                name: t.name,
                status: t.status,
                category: t.category,
                language: t.language,
                components: t.components,
                last_synced_at: new Date().toISOString()
            }, {
                onConflict: 'meta_template_id'
            })

            if (error) {
                console.error('Error upserting template:', t.name, error)
            } else {
                results.push(t.name)
            }
        }

        return NextResponse.json({ success: true, count: results.length, templates: results })

    } catch (error) {
        console.error('Sync error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
