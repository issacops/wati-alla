
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Settings as SettingsIcon } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Meta API Configuration Status
    const metaConfigured = !!(
        process.env.META_ACCESS_TOKEN &&
        process.env.META_WABA_ID &&
        process.env.META_PHONE_NUMBER_ID
    )

    const inngestConfigured = !!(
        process.env.INNGEST_EVENT_KEY &&
        process.env.INNGEST_SIGNING_KEY
    )

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your account and API configurations
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="text-base font-medium mt-1">
                                {user?.email || "Not available"}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">User ID</Label>
                            <p className="text-xs font-mono mt-1 text-muted-foreground">
                                {user?.id || "N/A"}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Account Created</Label>
                            <p className="text-base mt-1">
                                {user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString()
                                    : "N/A"
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Meta API Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>WhatsApp Business API</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground">Configuration Status</Label>
                            {metaConfigured ? (
                                <Badge className="bg-green-100 text-green-800" variant="outline">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Connected
                                </Badge>
                            ) : (
                                <Badge className="bg-red-100 text-red-800" variant="outline">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Not Configured
                                </Badge>
                            )}
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Access Token</Label>
                            <p className="text-sm mt-1">
                                {process.env.META_ACCESS_TOKEN
                                    ? `${process.env.META_ACCESS_TOKEN.substring(0, 20)}...`
                                    : "Not set"
                                }
                            </p>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">WhatsApp Business Account ID</Label>
                            <p className="text-sm font-mono mt-1">
                                {process.env.META_WABA_ID || "Not set"}
                            </p>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Phone Number ID</Label>
                            <p className="text-sm font-mono mt-1">
                                {process.env.META_PHONE_NUMBER_ID || "Not set"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Inngest Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Background Jobs (Inngest)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground">Configuration Status</Label>
                            {inngestConfigured ? (
                                <Badge className="bg-green-100 text-green-800" variant="outline">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Connected
                                </Badge>
                            ) : (
                                <Badge className="bg-red-100 text-red-800" variant="outline">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Not Configured
                                </Badge>
                            )}
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Event Key</Label>
                            <p className="text-sm mt-1">
                                {process.env.INNGEST_EVENT_KEY
                                    ? `${process.env.INNGEST_EVENT_KEY.substring(0, 20)}...`
                                    : "Not set"
                                }
                            </p>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Signing Key</Label>
                            <p className="text-sm mt-1">
                                {process.env.INNGEST_SIGNING_KEY
                                    ? `${process.env.INNGEST_SIGNING_KEY.substring(0, 20)}...`
                                    : "Not set"
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Database Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Database (Supabase)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground">Connection Status</Label>
                            <Badge className="bg-green-100 text-green-800" variant="outline">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Connected
                            </Badge>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Project URL</Label>
                            <p className="text-sm mt-1 break-all">
                                {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}
                            </p>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Database</Label>
                            <p className="text-sm mt-1">
                                PostgreSQL (Hosted)
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Information Card */}
            <Card className="border-teal-200 bg-teal-50">
                <CardContent className="pt-6">
                    <p className="text-sm text-teal-900">
                        <strong>Note:</strong> API credentials are managed through environment variables.
                        To update these settings, modify your <code className="bg-white px-1 py-0.5 rounded">.env.local</code> file
                        and restart the application.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
