
"use client"

import { useState, useEffect } from "react"
import { Search, Users } from "lucide-react"
import { CsvUploader } from "@/components/contacts/csv-uploader"
import { ColumnMapper } from "@/components/contacts/column-mapper"
import { ContactTable } from "@/components/contacts/contact-table"
import { importContacts, fetchContacts, getAllTags } from "./actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

export default function ContactsPage() {
    const [csvData, setCsvData] = useState<any[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    // View tab state
    const [contacts, setContacts] = useState<any[]>([])
    const [totalContacts, setTotalContacts] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [availableTags, setAvailableTags] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState("view")
    const perPage = 50

    useEffect(() => {
        if (activeTab === "view") {
            loadContacts()
            loadTags()
        }
    }, [activeTab, searchQuery, selectedTags, currentPage])

    async function loadContacts() {
        setLoading(true)
        try {
            const result = await fetchContacts({
                search: searchQuery || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
                page: currentPage,
                perPage,
            })
            setContacts(result.contacts)
            setTotalContacts(result.total)
        } catch (error) {
            toast.error("Failed to load contacts")
        } finally {
            setLoading(false)
        }
    }

    async function loadTags() {
        try {
            const tags = await getAllTags()
            setAvailableTags(tags)
        } catch (error) {
            console.error("Failed to load tags")
        }
    }

    const handleDataParsed = (data: any[], headers: string[]) => {
        setCsvData(data)
        setHeaders(headers)
    }

    const handleImport = async (mapping: any) => {
        setIsUploading(true)
        try {
            const result = await importContacts(csvData, mapping)
            toast.success(`Successfully imported ${result.count} contacts`)
            setCsvData([])
            setHeaders([])
            setActiveTab("view")
            loadContacts()
        } catch (error) {
            toast.error("Import failed")
            console.error(error)
        } finally {
            setIsUploading(false)
        }
    }

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
        setCurrentPage(1)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
                <p className="text-muted-foreground mt-1">Manage your audience and import new contacts</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border">
                    <TabsTrigger value="view">View Contacts</TabsTrigger>
                    <TabsTrigger value="import">Import CSV</TabsTrigger>
                </TabsList>

                <TabsContent value="view" className="space-y-4 mt-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="pl-9"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {totalContacts} total contacts
                        </div>
                    </div>

                    {availableTags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">Filter by tags:</span>
                            {availableTags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => {
                                        setSelectedTags([])
                                        setCurrentPage(1)
                                    }}
                                    className="text-sm text-muted-foreground hover:text-foreground underline"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading contacts...</p>
                        </div>
                    ) : contacts.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No contacts found"
                            description={
                                searchQuery || selectedTags.length > 0
                                    ? "Try adjusting your search or filters"
                                    : "Import your first contacts to get started"
                            }
                            action={
                                !searchQuery && selectedTags.length === 0
                                    ? {
                                        label: "Import Contacts",
                                        onClick: () => setActiveTab("import"),
                                    }
                                    : undefined
                            }
                        />
                    ) : (
                        <ContactTable
                            contacts={contacts}
                            total={totalContacts}
                            currentPage={currentPage}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            onRefresh={loadContacts}
                        />
                    )}
                </TabsContent>

                <TabsContent value="import" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Contacts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {csvData.length === 0 ? (
                                <CsvUploader onDataParsed={handleDataParsed} />
                            ) : (
                                <ColumnMapper
                                    data={csvData}
                                    headers={headers}
                                    onImport={handleImport}
                                    isUploading={isUploading}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
