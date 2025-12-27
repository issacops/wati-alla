
"use client"

import { cn } from "@/lib/utils"

interface WhatsAppPreviewProps {
    bodyText: string
    headerType: "NONE" | "TEXT" | "IMAGE"
    headerText?: string
    buttons?: { type: "QUICK_REPLY" | "URL"; text: string; url?: string }[]
    className?: string
}

export function WhatsAppPreview({
    bodyText,
    headerType,
    headerText,
    buttons = [],
    className,
}: WhatsAppPreviewProps) {

    // Basic variable formatting
    const formattedBody = bodyText.replace(/{{(\d+)}}/g, (match) => {
        return `<span class="font-bold text-teal-600 bg-teal-50 px-1 rounded">${match}</span>`
    })

    // Basic markdown formatting (*bold*, _italic_)
    const renderMarkdown = (text: string) => {
        let html = text
            // Bold
            .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
            // Italic
            .replace(/_(.*?)_/g, "<em>$1</em>")
            // Strikethrough
            .replace(/~(.*?)~/g, "<del>$1</del>")
            // Monospace
            .replace(/```(.*?)```/g, "<code>$1</code>")

        // Variables (handled above separately, but let's integrate)
        html = html.replace(/{{(\d+)}}/g, `<span class="font-bold text-teal-600 bg-teal-50 px-1 rounded">{{$1}}</span>`)

        return html
    }

    return (
        <div className={cn("bg-[#E5DDD5] p-4 rounded-xl max-w-sm font-sans mx-auto", className)}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
                {/* Header */}
                {headerType === "IMAGE" && (
                    <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                        [Header Image]
                    </div>
                )}
                {headerType === "TEXT" && headerText && (
                    <div className="px-4 pt-4 pb-1 font-bold text-black border-b border-gray-100">
                        {headerText}
                    </div>
                )}

                {/* Body */}
                <div
                    className="px-4 py-3 text-black whitespace-pre-wrap text-[15px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(bodyText || ' ') }}
                />

                {/* Timestamp */}
                <div className="px-4 pb-2 text-[10px] text-gray-500 text-right">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Buttons */}
            {buttons.length > 0 && (
                <div className="mt-2 space-y-2">
                    {buttons.map((btn, idx) => (
                        <div key={idx} className="bg-white rounded-lg py-2.5 text-center text-teal-600 font-medium shadow-sm active:bg-gray-50 cursor-pointer text-[15px]">
                            {btn.type === 'URL' && <span className="mr-2">↗</span>}
                            {btn.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
