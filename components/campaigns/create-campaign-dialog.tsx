"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Calendar, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createCampaign } from "@/app/dashboard/campaigns/actions"

const formSchema = z.object({
    name: z.string().min(1, "Campaign name is required"),
    templateId: z.string().min(1, "Please select a template"),
    tags: z.array(z.string()).optional(),
    sendNow: z.boolean(),
    scheduledAt: z.string().optional(),
})

interface CreateCampaignDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    templates: Array<{ id: string; name: string; category: string }>
    tags: string[]
    onSuccess?: () => void
}

export function CreateCampaignDialog({
    open,
    onOpenChange,
    templates,
    tags,
    onSuccess,
}: CreateCampaignDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            templateId: "",
            tags: [],
            sendNow: true,
            scheduledAt: "",
        },
    })

    const sendNow = form.watch("sendNow")
    const selectedTags = form.watch("tags") || []

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            await createCampaign({
                name: values.name,
                templateId: values.templateId,
                tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
                scheduledAt: !values.sendNow && values.scheduledAt ? values.scheduledAt : undefined,
            })

            toast.success(values.sendNow ? "Campaign started!" : "Campaign scheduled!")
            form.reset()
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create campaign")
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleTag = (tag: string) => {
        const current = form.getValues("tags") || []
        if (current.includes(tag)) {
            form.setValue("tags", current.filter(t => t !== tag))
        } else {
            form.setValue("tags", [...current, tag])
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Campaign</DialogTitle>
                    <DialogDescription>
                        Launch a WhatsApp broadcast campaign to your audience.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Campaign Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Summer Sale 2024" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="templateId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Template</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select approved template" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {templates.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground">
                                                    No approved templates found
                                                </div>
                                            ) : (
                                                templates.map((template) => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name}
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            ({template.category})
                                                        </span>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Only approved templates can be used
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3">
                            <Label>Target Audience</Label>
                            <p className="text-sm text-muted-foreground">
                                Select tags to filter audience, or leave empty to send to all contacts
                            </p>
                            {tags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <div
                                            key={tag}
                                            className="flex items-center space-x-2 border rounded-md px-3 py-2 hover:bg-accent cursor-pointer"
                                            onClick={() => toggleTag(tag)}
                                        >
                                            <Checkbox
                                                checked={selectedTags.includes(tag)}
                                                onCheckedChange={() => toggleTag(tag)}
                                            />
                                            <label className="text-sm font-medium cursor-pointer">
                                                {tag}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    No tags found in contacts
                                </p>
                            )}
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <FormField
                                control={form.control}
                                name="sendNow"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div>
                                            <FormLabel>Send Immediately</FormLabel>
                                            <FormDescription>
                                                Start the campaign right away
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {!sendNow && (
                                <FormField
                                    control={form.control}
                                    name="scheduledAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Schedule For</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Campaign will start at the specified time
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {sendNow ? "Start Campaign" : "Schedule Campaign"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
