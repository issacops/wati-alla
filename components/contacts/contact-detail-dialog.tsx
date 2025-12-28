"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    getContactById,
    updateContact,
    deleteContacts,
    toggleUnsubscribe,
} from "@/app/dashboard/contacts/actions"

interface ContactDetailDialogProps {
    contactId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ContactDetailDialog({
    contactId,
    open,
    onOpenChange,
    onSuccess,
}: ContactDetailDialogProps) {
    const [contact, setContact] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [name, setName] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState("")

    useEffect(() => {
        if (open && contactId) {
            loadContact()
        }
    }, [open, contactId])

    async function loadContact() {
        setLoading(true)
        try {
            const data = await getContactById(contactId)
            setContact(data)
            setName(data.name || "")
            setTags(data.tags || [])
        } catch (error) {
            toast.error("Failed to load contact")
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateContact(contactId, {
                name: name || null,
                tags: tags,
            })
            toast.success("Contact updated")
            setEditMode(false)
            loadContact()
            onSuccess?.()
        } catch (error) {
            toast.error("Failed to update contact")
        } finally {
            setSaving(false)
        }
    }

    const handleToggleSubscription = async () => {
        try {
            await toggleUnsubscribe(contactId, !contact.is_unsubscribed)
            toast.success(
                contact.is_unsubscribed ? "Contact resubscribed" : "Contact unsubscribed"
            )
            loadContact()
            onSuccess?.()
        } catch (error) {
            toast.error("Failed to update subscription")
        }
    }

    const handleDelete = async () => {
        try {
            await deleteContacts([contactId])
            toast.success("Contact deleted")
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            toast.error("Failed to delete contact")
        }
    }

    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag])
            setNewTag("")
        }
    }

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag))
    }

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (!contact) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Contact Details</DialogTitle>
                    <DialogDescription>
                        View and manage contact information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div>
                        <Label>Name</Label>
                        {editMode ? (
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contact name"
                                className="mt-1"
                            />
                        ) : (
                            <p className="text-base mt-1">{contact.name || "Unnamed"}</p>
                        )}
                    </div>

                    <div>
                        <Label>Phone Number</Label>
                        <p className="text-base font-mono mt-1">{contact.phone}</p>
                    </div>

                    <div>
                        <Label>Tags</Label>
                        {editMode ? (
                            <div className="space-y-2 mt-1">
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add tag"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                addTag()
                                            }
                                        }}
                                    />
                                    <Button onClick={addTag} size="sm">
                                        Add
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {contact.tags && contact.tags.length > 0 ? (
                                    contact.tags.map((tag: string, idx: number) => (
                                        <Badge key={idx} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No tags</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-3 mt-1">
                            {contact.is_unsubscribed ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                    Unsubscribed
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Active
                                </Badge>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleSubscription}
                            >
                                {contact.is_unsubscribed ? "Resubscribe" : "Unsubscribe"}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label>Added On</Label>
                        <p className="text-base text-muted-foreground mt-1">
                            {new Date(contact.created_at).toLocaleString()}
                        </p>
                    </div>

                    {contact.attributes &&
                        Object.keys(contact.attributes).length > 0 && (
                            <div>
                                <Label>Custom Attributes</Label>
                                <div className="mt-1 p-3 bg-muted rounded-md">
                                    <pre className="text-xs">
                                        {JSON.stringify(contact.attributes, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    {editMode ? (
                        <div className="flex gap-2 w-full">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditMode(false)
                                    setName(contact.name || "")
                                    setTags(contact.tags || [])
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Close
                                </Button>
                                <Button onClick={() => setEditMode(true)}>Edit</Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
