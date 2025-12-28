
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function fetchTemplates(filters?: {
    status?: string[]
}) {
    const supabase = createClient()

    let query = supabase
        .from('templates')
        .select('*')
        .order('last_synced_at', { ascending: false })

    if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
    }

    const { data, error } = await query

    if (error) {
        console.error('Fetch templates error:', error)
        return []
    }

    return data || []
}

export async function deleteTemplate(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error("Failed to delete template")
    }

    revalidatePath('/dashboard/templates')
}

export async function syncTemplates() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/templates/sync`)
        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error || 'Sync failed')
        }

        revalidatePath('/dashboard/templates')
        return data
    } catch (error) {
        throw error
    }
}
