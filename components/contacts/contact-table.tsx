"use client"

import { useState } from "react"
import { Search, Tag, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { ContactDetailDialog } from "./contact-detail-dialog"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import { deleteContacts } from "@/app/dashboard/contacts/actions"

interface Contact {
    id: string
    phone: string
    name: string | null
    tags: string[]
    is_unsubscribed: boolean
    created_at: string
}

interface ContactTableProps {
    contacts: Contact[]
    total: number
    currentPage: number
    perPage: number
    onPageChange: (page: number) => void
    onRefresh: () => void
}

export function ContactTable({
    contacts,
    total,
    currentPage,
    perPage,
    onPageChange,
    onRefresh,
}: ContactTableProps) {
    const [selected, setSelected] = useState<string[]>([])
    const [detailContactId, setDetailContactId] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const totalPages = Math.ceil(total / perPage)

    const toggleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selected.length === contacts.length) {
            setSelected([])
        } else {
            setSelected(contacts.map((c) => c.id))
        }
    }

    const handleDelete = async () => {
        try {
            await deleteContacts(selected)
            toast.success(`Deleted ${selected.length} contact(s)`)
            setSelected([])
            onRefresh()
        } catch (error) {
            toast.error("Failed to delete contacts")
        } finally {
            setDeleteDialogOpen(false)
        }
    }

    return (
        <div className="space-y-4">
            {selected.length > 0 && (
                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <span className="text-sm font-medium">
                        {selected.length} contact(s) selected
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                    </Button>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr className="border-b">
                            <th className="px-4 py-3 w-12">
                                <Checkbox
                                    checked={selected.length === contacts.length && contacts.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Tags</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Added</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact) => (
                            <tr
                                key={contact.id}
                                className="border-b hover:bg-muted/50 cursor-pointer"
                                onClick={() => setDetailContactId(contact.id)}
                            >
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selected.includes(contact.id)}
                                        onCheckedChange={() => toggleSelect(contact.id)}
                                    />
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    {contact.name || "Unnamed"}
                                </td>
                                <td className="px-4 py-3 text-sm font-mono">{contact.phone}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {contact.tags && contact.tags.length > 0 ? (
                                            contact.tags.slice(0, 3).map((tag, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No tags</span>
                                        )}
                                        {contact.tags && contact.tags.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{contact.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {contact.is_unsubscribed ? (
                                        <Badge variant="outline" className="bg-red-50 text-red-700">
                                            Unsubscribed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            Active
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                    {new Date(contact.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}

            {detailContactId && (
                <ContactDetailDialog
                    contactId={detailContactId}
                    open={!!detailContactId}
                    onOpenChange={(open) => !open && setDetailContactId(null)}
                    onSuccess={onRefresh}
                />
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Contacts?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selected.length} contact(s). This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
