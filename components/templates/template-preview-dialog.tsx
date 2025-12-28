"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { WhatsAppPreview } from "./whatsapp-preview"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

interface TemplatePreviewDialogProps {
    template: {
        name: string
        status: string
        category: string | null
        language: string
        components: any
    }
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TemplatePreviewDialog({
    template,
    open,
    onOpenChange,
}: TemplatePreviewDialogProps) {
    const components = template.components || []

    // Extract body text
    const bodyComponent = components.find((c: any) => c.type === "BODY")
    const bodyText = bodyComponent?.text || ""

    // Extract header
    const headerComponent = components.find((c: any) => c.type === "HEADER")
    const headerType = headerComponent ? (headerComponent.format || "TEXT") : "NONE"
    const headerText = headerComponent?.text || ""

    // Extract buttons
    const buttonsComponent = components.find((c: any) => c.type === "BUTTONS")
    const buttons = buttonsComponent?.buttons || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template.name}</DialogTitle>
                    <DialogDescription>
                        Template preview and metadata
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Preview */}
                    <div>
                        <Label className="block mb-4">WhatsApp Preview</Label>
                        <div className="bg-slate-50 p-8 rounded-lg flex items-center justify-center min-h-[400px]">
                            <WhatsAppPreview
                                bodyText={bodyText}
                                headerType={headerType}
                                headerText={headerText}
                                buttons={buttons}
                            />
                        </div>
                    </div>

                    {/* Right: Metadata */}
                    <div className="space-y-6">
                        <div>
                            <Label>Status</Label>
                            <div className="mt-1">
                                <Badge
                                    className={
                                        template.status === "APPROVED"
                                            ? "bg-green-100 text-green-800"
                                            : template.status === "REJECTED"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                    }
                                    variant="outline"
                                >
                                    {template.status}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <Label>Category</Label>
                            <p className="text-base mt-1 capitalize">
                                {template.category?.toLowerCase() || "N/A"}
                            </p>
                        </div>

                        <div>
                            <Label>Language</Label>
                            <p className="text-base mt-1">{template.language}</p>
                        </div>

                        <div>
                            <Label>Components Structure</Label>
                            <div className="mt-1 p-4 bg-muted rounded-md overflow-auto max-h-[300px]">
                                <pre className="text-xs">
                                    {JSON.stringify(template.components, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
