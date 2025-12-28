
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Send, CheckCheck, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { calculateReadRate, getGrowthPercentage } from "@/lib/utils/analytics"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = createClient()

    // Parallel fetch for stats
    // 1. Total Contacts
    const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('is_unsubscribed', false)

    // 2. Messages Sent (This month)
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('success_count, total_audience, created_at, status, name, id')
        .order('created_at', { ascending: false })
        .limit(5)

    const totalSent = campaigns?.reduce((acc, curr) => acc + (curr.success_count || 0), 0) || 0

    // 3. Read Rate (Real calculation from campaign_logs)
    const readRate = await calculateReadRate()

    // 4. Growth calculations
    const contactGrowth = await getGrowthPercentage('contacts')
    const messageGrowth = await getGrowthPercentage('messages')

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-1">Overview of your campaigns and audience.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalContacts || 0}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            {contactGrowth >= 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-600">+{contactGrowth}%</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                    <span className="text-red-600">{contactGrowth}%</span>
                                </>
                            )}
                            <span>from last month</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSent}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            {messageGrowth >= 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-600">+{messageGrowth}%</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                    <span className="text-red-600">{messageGrowth}%</span>
                                </>
                            )}
                            <span>from last month</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Read Rate</CardTitle>
                        <CheckCheck className="h-4 w-4 text-teal-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{readRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all campaigns
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Campaigns</CardTitle>
                        <Link href="/dashboard/campaigns">
                            <button className="text-sm text-primary hover:underline">
                                View all
                            </button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Sent</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {campaigns?.map((c) => (
                                        <tr key={c.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">
                                                <Link href={`/dashboard/campaigns/${c.id}`} className="hover:underline">
                                                    {c.name}
                                                </Link>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                                            ${c.status === 'COMPLETED' ? 'border-transparent bg-teal-500 text-white shadow hover:bg-teal-600' :
                                                        c.status === 'FAILED' ? 'border-transparent bg-red-500 text-white hover:bg-red-600' :
                                                            'text-foreground'
                                                    }
                                        `}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">{c.success_count}/{c.total_audience}</td>
                                            <td className="p-4 align-middle text-right">{new Date(c.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {(!campaigns || campaigns.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-muted-foreground">No campaigns found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
