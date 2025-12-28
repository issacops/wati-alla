
"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTemplateForm } from "@/components/templates/create-template-form"
import { TemplateTable } from "@/components/templates/template-table"
import { Button } from "@/components/ui/button"
import { RefreshCw, Filter } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { MessageSquare } from "lucide-react"
import { fetchTemplates, syncTemplates } from "./actions"
import { toast } from "sonner"

export default function TemplatesPage() {
    const [activeTab, setActiveTab] = useState("list")
    const [templates, setTemplates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")

    useEffect(() => {
        loadTemplates()
    }, [statusFilter])

    async function loadTemplates() {
        setLoading(true)
        try {
            const filters: any = {}
            if (statusFilter !== "all") {
                filters.status = [statusFilter.toUpperCase()]
            }

            const data = await fetchTemplates(filters)
            setTemplates(data)
        } catch (error) {
            toast.error("Failed to load templates")
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async () => {
        setSyncing(true)
        try {
            const result = await syncTemplates()
            toast.success(`Synced ${result.count} templates from Meta`)
            loadTemplates()
        } catch (error) {
            toast.error("Sync failed")
        } finally {
            setSyncing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Message Templates</h2>
                    <p className="text-muted-foreground mt-1">Create and manage your WhatsApp templates.</p>
                </div>
                <Button variant="outline" onClick={handleSync} disabled={syncing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                    Sync from Meta
                </Button>
            </div>

            <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border">
                    <TabsTrigger value="list">All Templates</TabsTrigger>
                    <TabsTrigger value="create">Create New</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-sm text-muted-foreground">
                            {templates.length} template(s)
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading templates...</p>
                        </div>
                    ) : templates.length === 0 ? (
                        <EmptyState
                            icon={MessageSquare}
                            title="No templates found"
                            description="Sync with Meta or create a new template to get started"
                            action={{
                                label: "Create Template",
                                onClick: () => setActiveTab("create"),
                            }}
                        />
                    ) : (
                        <TemplateTable templates={templates} onRefresh={loadTemplates} />
                    )}
                </TabsContent>

                <TabsContent value="create" className="mt-6">
                    <CreateTemplateForm onSuccess={() => setActiveTab('list')} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
