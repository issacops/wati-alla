
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTemplateForm } from "@/components/templates/create-template-form"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function TemplatesPage() {
    const [activeTab, setActiveTab] = useState("create")
    // In real app, we fetch templates here. Mocking for UI readiness.
    const [templates, setTemplates] = useState<any[]>([])

    const syncTemplates = async () => {
        // Call Sync API
        try {
            const res = await fetch('/api/templates/sync')
            const data = await res.json()
            alert(`Synced: ${data.count} templates`) // Simple alert for MVP
            // setTemplates(data.templates) // if API returned full objects
        } catch (e) {
            console.error(e)
            alert("Sync failed")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Message Templates</h2>
                    <p className="text-muted-foreground mt-1">Create and manage your WhatsApp templates.</p>
                </div>
                <Button variant="outline" onClick={syncTemplates}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync from Meta
                </Button>
            </div>

            <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border">
                    <TabsTrigger value="list">All Templates</TabsTrigger>
                    <TabsTrigger value="create">Create New</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-6">
                    <div className="border rounded-lg bg-white p-12 text-center text-gray-500">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-medium text-black">No templates loaded</h3>
                            <p className="mt-2 text-sm">Sync with Meta or create a new template to get started.</p>
                            <Button onClick={() => setActiveTab('create')} className="mt-4">Create Template</Button>
                        </div>
                        {/* 
                Here we would map through 'templates' and render a Table.
                Skipping full table implementation for brevity as per MVP prompt focus on Create Flow.
            */}
                    </div>
                </TabsContent>

                <TabsContent value="create" className="mt-6">
                    <CreateTemplateForm onSuccess={() => setActiveTab('list')} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
