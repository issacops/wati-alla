"use client"

import { useState } from "react"
import { Eye, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TemplatePreviewDialog } from "./template-preview-dialog"
import { toast } from "sonner"
import { deleteTemplate } from "@/app/dashboard/templates/actions"

interface Template {
    id: string
    name: string
    status: string
    category: string | null
    language: string
    components: any
    last_synced_at: string
}

interface TemplateTableProps {
    templates: Template[]
    onRefresh: () => void
}

export function TemplateTable({ templates, onRefresh }: TemplateTableProps) {
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            APPROVED: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800",
        }

        return (
            <Badge className={variants[status] || ""} variant="outline">
                {status}
            </Badge>
        )
    }

    const handleDelete = async () => {
        if (!templateToDelete) return

        try {
            await deleteTemplate(templateToDelete)
            toast.success("Template deleted from local database")
            onRefresh()
        } catch (error) {
            toast.error("Failed to delete template")
        } finally {
            setDeleteDialogOpen(false)
            setTemplateToDelete(null)
        }
    }

    return (
        <>
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr className="border-b">
                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Language</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Last Synced</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.map((template) => (
                            <tr key={template.id} className="border-b hover:bg-muted/50">
                                <td className="px-4 py-3 font-medium">{template.name}</td>
                                <td className="px-4 py-3">{getStatusBadge(template.status)}</td>
                                <td className="px-4 py-3 text-sm capitalize">
                                    {template.category?.toLowerCase() || "N/A"}
                                </td>
                                <td className="px-4 py-3 text-sm">{template.language}</td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                    {new Date(template.last_synced_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPreviewTemplate(template)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Preview
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setTemplateToDelete(template.id)
                                                setDeleteDialogOpen(true)
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {previewTemplate && (
                <TemplatePreviewDialog
                    template={previewTemplate}
                    open={!!previewTemplate}
                    onOpenChange={(open) => !open && setPreviewTemplate(null)}
                />
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the template from your local database only. To delete it
                            from Meta, use the Meta Business Manager.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
