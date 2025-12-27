
export function cleanPhoneNumber(input: string): string | null {
    // Remove all non-digit characters
    let cleaned = input.replace(/\D/g, '')

    // Logic: "If it starts with '91' keep it. If 10 digits, add '91'. If it starts with '0', replace with '91'."

    if (cleaned.startsWith('0')) {
        cleaned = '91' + cleaned.substring(1)
    }

    if (cleaned.length === 10) {
        cleaned = '91' + cleaned
    }

    // Basic validation: E.164 for India implies 12 digits (91 + 10 digits)
    // But let's just enable simple cleaning as requested.
    // Ideally return +91... format if strictly E.164, but numeric string is often easier for DB.
    // Prompt says "Return E.164 string". Standard E.164 includes '+'. 
    // But many APIs take just digits. I will return with '+' to be compliant with "E.164 string" definition.

    if (cleaned.length < 10) {
        return null // Invalid
    }

    return '+' + cleaned
}
