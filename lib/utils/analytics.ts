
import { createClient } from "@/lib/supabase/server"

export interface CampaignMetrics {
    totalSent: number
    delivered: number
    read: number
    failed: number
    deliveryRate: number
    readRate: number
}

export async function calculateReadRate(): Promise<number> {
    const supabase = createClient()

    const { data: logs } = await supabase
        .from('campaign_logs')
        .select('status')

    if (!logs || logs.length === 0) return 0

    const readCount = logs.filter(log => log.status === 'read').length
    const deliveredCount = logs.filter(log => ['delivered', 'read'].includes(log.status)).length

    if (deliveredCount === 0) return 0

    return Math.round((readCount / deliveredCount) * 100)
}

export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const supabase = createClient()

    const { data: logs } = await supabase
        .from('campaign_logs')
        .select('status')
        .eq('campaign_id', campaignId)

    if (!logs) {
        return {
            totalSent: 0,
            delivered: 0,
            read: 0,
            failed: 0,
            deliveryRate: 0,
            readRate: 0,
        }
    }

    const totalSent = logs.length
    const delivered = logs.filter(log => ['delivered', 'read'].includes(log.status)).length
    const read = logs.filter(log => log.status === 'read').length
    const failed = logs.filter(log => log.status === 'failed').length

    const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0
    const readRate = delivered > 0 ? Math.round((read / delivered) * 100) : 0

    return {
        totalSent,
        delivered,
        read,
        failed,
        deliveryRate,
        readRate,
    }
}

export async function getGrowthPercentage(metric: 'contacts' | 'messages'): Promise<number> {
    const supabase = createClient()
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    if (metric === 'contacts') {
        const { count: lastMonthCount } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .lt('created_at', thisMonth.toISOString())

        const { count: thisMonthCount } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thisMonth.toISOString())

        if (!lastMonthCount || lastMonthCount === 0) return 100
        return Math.round(((thisMonthCount || 0) / lastMonthCount) * 100)
    }

    // For messages
    const { data: lastMonthCampaigns } = await supabase
        .from('campaigns')
        .select('success_count')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', thisMonth.toISOString())

    const { data: thisMonthCampaigns } = await supabase
        .from('campaigns')
        .select('success_count')
        .gte('created_at', thisMonth.toISOString())

    const lastMonthTotal = lastMonthCampaigns?.reduce((acc, c) => acc + (c.success_count || 0), 0) || 0
    const thisMonthTotal = thisMonthCampaigns?.reduce((acc, c) => acc + (c.success_count || 0), 0) || 0

    if (lastMonthTotal === 0) return 100
    return Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
}

export async function getTopTemplates(limit = 5) {
    const supabase = createClient()

    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('template_id, success_count, total_audience')
        .eq('status', 'COMPLETED')

    if (!campaigns) return []

    const templateStats = campaigns.reduce((acc: any, campaign) => {
        const id = campaign.template_id
        if (!id) return acc

        if (!acc[id]) {
            acc[id] = { templateId: id, totalSent: 0, totalSuccess: 0 }
        }

        acc[id].totalSent += campaign.total_audience || 0
        acc[id].totalSuccess += campaign.success_count || 0

        return acc
    }, {})

    const statsArray = Object.values(templateStats) as any[]
    const sorted = statsArray
        .map((stat: any) => ({
            ...stat,
            successRate: stat.totalSent > 0 ? (stat.totalSuccess / stat.totalSent) * 100 : 0,
        }))
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, limit)

    // Fetch template names
    const templateIds = sorted.map(s => s.templateId)
    const { data: templates } = await supabase
        .from('templates')
        .select('id, name')
        .in('id', templateIds)

    return sorted.map(stat => ({
        ...stat,
        name: templates?.find(t => t.id === stat.templateId)?.name || 'Unknown',
    }))
}
