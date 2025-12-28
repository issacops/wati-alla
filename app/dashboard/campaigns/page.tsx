"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { CreateCampaignDialog } from "@/components/campaigns/create-campaign-dialog"
import {
    fetchCampaigns,
    getApprovedTemplates,
    getContactTags,
    deleteCampaign,
} from "./actions"
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
import { toast } from "sonner"

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [templates, setTemplates] = useState<any[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null)

    async function loadData() {
        setLoading(true)
        try {
            const filters: any = {}
            if (statusFilter !== "all") {
                filters.status = [statusFilter.toUpperCase()]
            }
            if (searchQuery) {
                filters.search = searchQuery
            }

            const [campaignsData, templatesData, tagsData] = await Promise.all([
                fetchCampaigns(filters),
                getApprovedTemplates(),
                getContactTags(),
            ])

            setCampaigns(campaignsData)
            setTemplates(templatesData)
            setTags(tagsData)
        } catch (error) {
            console.error("Failed to load campaigns:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [statusFilter, searchQuery])

    const handleDelete = async () => {
        if (!campaignToDelete) return

        try {
            await deleteCampaign(campaignToDelete)
            toast.success("Campaign deleted")
            loadData()
        } catch (error) {
            toast.error("Failed to delete campaign")
        } finally {
            setDeleteDialogOpen(false)
            setCampaignToDelete(null)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            DRAFT: "bg-gray-100 text-gray-800",
            SCHEDULED: "bg-blue-100 text-blue-800",
            SENDING: "bg-yellow-100 text-yellow-800",
            COMPLETED: "bg-green-100 text-green-800",
            FAILED: "bg-red-100 text-red-800",
        }

        return (
            <Badge className={variants[status] || ""} variant="outline">
                {status}
            </Badge>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your WhatsApp broadcast campaigns
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="sending">Sending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading campaigns...</p>
                </div>
            ) : campaigns.length === 0 ? (
                <EmptyState
                    icon={Plus}
                    title="No campaigns yet"
                    description="Create your first campaign to start sending WhatsApp messages to your audience"
                    action={{
                        label: "Create Campaign",
                        onClick: () => setCreateDialogOpen(true),
                    }}
                />
            ) : (
                <div className="border rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Template</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Audience</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Success Rate</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="border-b hover:bg-muted/50">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/dashboard/campaigns/${campaign.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {campaign.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {campaign.templates?.name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(campaign.status)}</td>
                                        <td className="px-4 py-3 text-sm">{campaign.total_audience || 0}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {campaign.total_audience > 0
                                                ? `${Math.round(
                                                    (campaign.success_count / campaign.total_audience) * 100
                                                )}%`
                                                : "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {new Date(campaign.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/dashboard/campaigns/${campaign.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                                {campaign.status === "DRAFT" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCampaignToDelete(campaign.id)
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <CreateCampaignDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                templates={templates}
                tags={tags}
                onSuccess={() => loadData()}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the campaign.
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
