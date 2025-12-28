
"use server"

import { createClient } from "@/lib/supabase/server"
import { inngest } from "@/lib/inngest/client"
import { revalidatePath } from "next/cache"

export async function createCampaign(data: {
    name: string
    templateId: string
    tags?: string[]
    scheduledAt?: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Fetch audience count
    let query = supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('is_unsubscribed', false)

    if (data.tags && data.tags.length > 0) {
        query = query.overlaps('tags', data.tags)
    }

    const { count: audienceCount } = await query

    // Create campaign
    const status = data.scheduledAt ? 'SCHEDULED' : 'DRAFT'

    const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
            name: data.name,
            template_id: data.templateId,
            status: status,
            scheduled_at: data.scheduledAt || null,
            total_audience: audienceCount || 0,
        })
        .select()
        .single()

    if (error) {
        console.error('Campaign creation error:', error)
        throw new Error("Failed to create campaign")
    }

    // If send now, trigger Inngest
    if (!data.scheduledAt) {
        await inngest.send({
            name: "broadcast/start",
            data: { campaignId: campaign.id },
        })
    }

    revalidatePath('/dashboard/campaigns')
    return campaign
}

export async function fetchCampaigns(filters?: {
    status?: string[]
    search?: string
}) {
    const supabase = createClient()

    let query = supabase
        .from('campaigns')
        .select(`
      *,
      templates (
        name,
        category
      )
    `)
        .order('created_at', { ascending: false })

    if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
    }

    if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Fetch campaigns error:', error)
        return []
    }

    return data || []
}

export async function deleteCampaign(id: string) {
    const supabase = createClient()

    // Only allow deleting draft campaigns
    const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('status', 'DRAFT')

    if (error) {
        throw new Error("Failed to delete campaign")
    }

    revalidatePath('/dashboard/campaigns')
}

export async function getCampaignById(id: string) {
    const supabase = createClient()

    const { data: campaign, error } = await supabase
        .from('campaigns')
        .select(`
      *,
      templates (
        name,
        category,
        components
      )
    `)
        .eq('id', id)
        .single()

    if (error) {
        throw new Error("Campaign not found")
    }

    return campaign
}

export async function getCampaignLogs(campaignId: string) {
    const supabase = createClient()

    const { data: logs, error } = await supabase
        .from('campaign_logs')
        .select(`
      *,
      contacts (
        name,
        phone
      )
    `)
        .eq('campaign_id', campaignId)
        .order('updated_at', { ascending: false })

    if (error) {
        return []
    }

    return logs || []
}

export async function getApprovedTemplates() {
    const supabase = createClient()

    const { data: templates } = await supabase
        .from('templates')
        .select('id, name, category, status')
        .eq('status', 'APPROVED')
        .order('name')

    return templates || []
}

export async function getContactTags() {
    const supabase = createClient()

    const { data: contacts } = await supabase
        .from('contacts')
        .select('tags')
        .not('tags', 'is', null)

    if (!contacts) return []

    const tagsSet = new Set<string>()
    contacts.forEach(contact => {
        if (contact.tags && Array.isArray(contact.tags)) {
            contact.tags.forEach((tag: string) => tagsSet.add(tag))
        }
    })

    return Array.from(tagsSet).sort()
}
