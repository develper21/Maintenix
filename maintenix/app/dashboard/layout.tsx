"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Wrench, Package, Users, Calendar, BarChart3, Moon, Sun, Factory, FolderKanban } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Requests", href: "/dashboard/requests", icon: Wrench },
        { name: "Equipment", href: "/dashboard/equipment", icon: Package },
        { name: "Categories", href: "/dashboard/equipment-categories", icon: FolderKanban },
        { name: "Work Centers", href: "/dashboard/work-centers", icon: Factory },
        { name: "Teams", href: "/dashboard/teams", icon: Users },
        { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
        { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ]

    if (status === "loading" || !mounted) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-pulse text-lg">Loading...</div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card/50 backdrop-blur-xl">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center border-b px-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            MAINTENIX
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Info */}
                    <div className="border-t p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {session.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{session.user?.name}</span>
                                    <span className="text-xs text-muted-foreground">{(session.user as { role?: string })?.role}</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto p-6 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    )
}
