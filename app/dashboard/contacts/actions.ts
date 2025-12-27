
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
