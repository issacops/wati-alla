
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Send, Users, CheckCircle2, XCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCampaignById, getCampaignLogs } from "../actions"
import { getCampaignMetrics } from "@/lib/utils/analytics"

export default async function CampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    let campaign
    let logs
    let metrics

    try {
        [campaign, logs, metrics] = await Promise.all([
            getCampaignById(id),
            getCampaignLogs(id),
            getCampaignMetrics(id),
        ])
    } catch (error) {
        notFound()
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

    const getLogStatusIcon = (status: string) => {
        switch (status) {
            case "sent":
            case "delivered":
            case "read":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "failed":
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/campaigns">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight">{campaign.name}</h2>
                        {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalSent}</div>
                        <p className="text-xs text-muted-foreground">
                            Target: {campaign.total_audience || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.delivered}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.deliveryRate}% delivery rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Read</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-teal-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.read}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.readRate}% read rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.failed}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.totalSent > 0
                                ? Math.round((metrics.failed / metrics.totalSent) * 100)
                                : 0}% failure rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Template</p>
                            <p className="text-base">{campaign.templates?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Category</p>
                            <p className="text-base capitalize">
                                {campaign.templates?.category?.toLowerCase() || "N/A"}
                            </p>
                        </div>
                        {campaign.scheduled_at && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Scheduled For</p>
                                <p className="text-base">
                                    {new Date(campaign.scheduled_at).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {campaign.status === "SENDING" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Sending messages...</span>
                                    <span>
                                        {metrics.totalSent} / {campaign.total_audience}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-teal-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${campaign.total_audience > 0
                                                    ? (metrics.totalSent / campaign.total_audience) * 100
                                                    : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Message Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Updated</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Message ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            No messages sent yet
                                        </td>
                                    </tr>
                                ) : (
                                    logs.slice(0, 100).map((log: any) => (
                                        <tr key={log.id} className="border-b hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                {log.contacts?.name || "Unknown"}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono">
                                                {log.contacts?.phone || "N/A"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {getLogStatusIcon(log.status)}
                                                    <span className="text-sm capitalize">{log.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(log.updated_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                                                {log.meta_message_id || "N/A"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {logs.length > 100 && (
                        <p className="text-sm text-muted-foreground mt-4 text-center">
                            Showing first 100 messages. Total: {logs.length}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
