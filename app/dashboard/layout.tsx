
import Link from "next/link"
import { LayoutDashboard, Users, MessageSquare, Send, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight text-teal-400">MVP Daddy</h1>
                    <p className="text-xs text-slate-400">CONNECT</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-slate-800 text-white">
                        <LayoutDashboard className="w-5 h-5 mr-3 text-teal-400" />
                        Dashboard
                    </Link>
                    <Link href="/dashboard/contacts" className="flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                        <Users className="w-5 h-5 mr-3" />
                        Contacts
                    </Link>
                    <Link href="/dashboard/templates" className="flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                        <MessageSquare className="w-5 h-5 mr-3" />
                        Templates
                    </Link>
                    <Link href="/dashboard/campaigns" className="flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                        <Send className="w-5 h-5 mr-3" />
                        Campaigns
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="text-sm font-medium text-gray-500">Welcome back, Admin</div>
                    <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold border border-teal-200">
                        A
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
