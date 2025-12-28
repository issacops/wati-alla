
"use server"

import { createClient } from "@/lib/supabase/server"
import { cleanPhoneNumber } from "@/lib/utils/phone"
import { revalidatePath } from "next/cache"

export async function importContacts(data: any[], mapping: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { phone, name, tag, attributes } = mapping

    const contactsToInsert = data.map((row) => {
        const rawPhone = row[phone]
        const cleanedPhone = cleanPhoneNumber(rawPhone)

        if (!cleanedPhone) return null // Skip invalid phones

        const attribs: any = {}
        if (Array.isArray(attributes)) {
            attributes.forEach(attrCol => {
                attribs[attrCol] = row[attrCol]
            })
        }

        const tags: string[] = []
        if (tag && row[tag]) {
            // Assume comma separated or single tag? Prompt implies "Tags (Text array)".
            // Simple logic: split by comma if string
            if (typeof row[tag] === 'string') {
                tags.push(...row[tag].split(',').map((t: string) => t.trim()))
            } else {
                tags.push(String(row[tag]))
            }
        }

        return {
            phone: cleanedPhone,
            name: name ? row[name] : null,
            attributes: attribs,
            tags: tags,
            // On conflict logic will be handled by upsert
        }
    }).filter(Boolean)

    if (contactsToInsert.length === 0) {
        return { count: 0 }
    }

    // Batch insert (Chunking might be needed for very large CSVs, 
    // but Supabase handles reasonably sized batches. 
    // For production, chunking 1000 is safer.)

    const CHUNK_SIZE = 1000
    let totalInserted = 0

    for (let i = 0; i < contactsToInsert.length; i += CHUNK_SIZE) {
        const chunk = contactsToInsert.slice(i, i + CHUNK_SIZE)

        const { error } = await supabase.from('contacts').upsert(chunk as any, {
            onConflict: 'phone',
            // we want to merge/update
        })

        if (error) {
            console.error("Import error", error)
            // Continue or throw? throw for now.
            throw new Error("Database error during import")
        }
        totalInserted += chunk.length
    }

    revalidatePath('/dashboard/contacts')
    return { count: totalInserted }
}

export async function fetchContacts(filters?: {
    search?: string
    tags?: string[]
    page?: number
    perPage?: number
}) {
    const supabase = createClient()
    const page = filters?.page || 1
    const perPage = filters?.perPage || 50
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Fetch contacts error:', error)
        return { contacts: [], total: 0 }
    }

    return { contacts: data || [], total: count || 0 }
}

export async function updateContact(id: string, updates: {
    name?: string
    tags?: string[]
    attributes?: any
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from('contacts')
        .update({
            name: updates.name,
            tags: updates.tags,
            attributes: updates.attributes,
        })
        .eq('id', id)

    if (error) {
        throw new Error("Failed to update contact")
    }

    revalidatePath('/dashboard/contacts')
}

export async function deleteContacts(ids: string[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', ids)

    if (error) {
        throw new Error("Failed to delete contacts")
    }

    revalidatePath('/dashboard/contacts')
}

export async function toggleUnsubscribe(id: string, unsubscribe: boolean) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from('contacts')
        .update({ is_unsubscribed: unsubscribe })
        .eq('id', id)

    if (error) {
        throw new Error("Failed to update subscription status")
    }

    revalidatePath('/dashboard/contacts')
}

export async function getContactById(id: string) {
    const supabase = createClient()

    const { data: contact, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        throw new Error("Contact not found")
    }

    return contact
}

export async function getAllTags() {
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
