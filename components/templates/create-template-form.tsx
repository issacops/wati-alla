
"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WhatsAppPreview } from "./whatsapp-preview"

const formSchema = z.object({
    name: z.string().min(1, "Name is required").regex(/^[a-z0-9_]+$/, "Lowercase and underscores only"),
    category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
    language: z.string().default("en_US"),
    headerType: z.enum(["NONE", "TEXT", "IMAGE"]),
    headerText: z.string().optional(),
    bodyText: z.string().min(1, "Body text is required"),
    buttons: z.array(z.object({
        type: z.enum(["QUICK_REPLY", "URL"]),
        text: z.string().min(1, "Button text required"),
        url: z.string().optional()
    })).optional()
})

export function CreateTemplateForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "MARKETING",
            language: "en_US",
            headerType: "NONE",
            bodyText: "",
            buttons: []
        },
    })

    // Watch for preview
    const watchedValues = form.watch()
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "buttons"
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/templates/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create template')
            }

            toast.success("Template created successfully!")
            form.reset()
            onSuccess?.()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>Define your template structure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="seasonal_promo_2024" {...field} />
                                        </FormControl>
                                        <FormDescription>Lowercase and underscores only.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MARKETING">Marketing</SelectItem>
                                                    <SelectItem value="UTILITY">Utility</SelectItem>
                                                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="language"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Language</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select language" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="en_US">English (US)</SelectItem>
                                                    <SelectItem value="es_ES">Spanish (Spain)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="headerType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Header Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select header type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NONE">None</SelectItem>
                                                <SelectItem value="TEXT">Text</SelectItem>
                                                <SelectItem value="IMAGE">Image</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchedValues.headerType === 'TEXT' && (
                                <FormField
                                    control={form.control}
                                    name="headerText"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Header Text</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Special Offer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="bodyText"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Body Text</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Hello, check out our new offers..."
                                                className="h-32"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Use {"{{1}}"}, {"{{2}}"} for variables. *bold*, _italics_.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Buttons Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <FormLabel>Buttons (Optional)</FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ type: "QUICK_REPLY", text: "" })}
                                        disabled={fields.length >= 3}
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Button
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start p-3 border rounded-md">
                                        <div className="grid gap-2 flex-1">
                                            <FormField
                                                control={form.control}
                                                name={`buttons.${index}.type`}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                                            <SelectItem value="URL">URL</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`buttons.${index}.text`}
                                                render={({ field }) => (
                                                    <Input placeholder="Button Text" className="h-8" {...field} />
                                                )}
                                            />
                                            {form.watch(`buttons.${index}.type`) === 'URL' && (
                                                <FormField
                                                    control={form.control}
                                                    name={`buttons.${index}.url`}
                                                    render={({ field }) => (
                                                        <Input placeholder="https://example.com" className="h-8" {...field} />
                                                    )}
                                                />
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit to Meta
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Right: Visualizer */}
            <div className="space-y-6">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>Real-time WhatsApp rendering.</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-slate-50 min-h-[400px] flex items-center justify-center rounded-b-xl">
                        <WhatsAppPreview
                            bodyText={watchedValues.bodyText || ''}
                            headerType={watchedValues.headerType}
                            headerText={watchedValues.headerText}
                            buttons={watchedValues.buttons}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
