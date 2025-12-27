"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Wrench, Users, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getStatusColor, getPriorityColor, formatDate } from "@/lib/utils"

interface DashboardStats {
    totalEquipment: number
    criticalEquipment: number
    activeRequests: number
    urgentRequests: number
    completedToday: number
    technicianLoad: number
}

interface RequestRow {
    id: string
    requestId: string
    subject: string
    equipment: { name: string } | null
    workCenter: { name: string } | null
    assignedTo: { name: string } | null
    createdBy: { name: string }
    status: string
    priority: string
    createdAt: string
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [requests, setRequests] = useState<RequestRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [equipmentRes, requestsRes] = await Promise.all([
                fetch("/api/equipment"),
                fetch("/api/requests"),
            ])

            const equipment = await equipmentRes.json() as Array<{ healthPercentage?: number }>
            const allRequests = await requestsRes.json() as Array<{ status: string; priority: string; updatedAt: string }>

            // Calculate stats
            const criticalEquipment = equipment.filter((e) =>
                (e.healthPercentage || 100) < 30
            ).length

            const activeRequests = allRequests.filter((r) =>
                r.status === "NEW" || r.status === "IN_PROGRESS"
            ).length

            const urgentRequests = allRequests.filter((r) =>
                r.priority === "URGENT"
            ).length

            const today = new Date().toDateString()
            const completedToday = allRequests.filter((r) =>
                r.status === "REPAIRED" && new Date(r.updatedAt).toDateString() === today
            ).length

            // Calculate technician load (simplified)
            const technicianLoad = Math.min(Math.round((activeRequests / equipment.length) * 100), 100)

            setStats({
                totalEquipment: equipment.length,
                criticalEquipment,
                activeRequests,
                urgentRequests,
                completedToday,
                technicianLoad,
            })

            // Get recent requests for table
            const allRequestsFull = await requestsRes.json() as RequestRow[]
            setRequests(allRequestsFull.slice(0, 10))
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-lg">Loading dashboard...</div>
            </div>
        )
    }

    const statCards = [
        {
            title: "Critical Equipment",
            value: stats.criticalEquipment,
            subtitle: `${stats.totalEquipment} total`,
            icon: AlertTriangle,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
            href: "/dashboard/equipment?filter=critical",
        },
        {
            title: "Technician Load",
            value: `${stats.technicianLoad}%`,
            subtitle: stats.technicianLoad > 85 ? "Assign carefully" : "Normal load",
            icon: TrendingUp,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            href: "/dashboard/teams",
        },
        {
            title: "Open Requests",
            value: stats.activeRequests,
            subtitle: `${stats.urgentRequests} urgent`,
            icon: Wrench,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            href: "/dashboard/requests",
        },
        {
            title: "Completed Today",
            value: stats.completedToday,
            subtitle: "Maintenance tasks",
            icon: CheckCircle,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            href: "/dashboard/reports",
        },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to MAINTENIX</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="card-hover cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Requests Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Maintenance Requests</CardTitle>
                        <Link href="/dashboard/requests">
                            <Button variant="outline" size="sm">View All</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-sm text-muted-foreground">
                                    <th className="text-left p-3">Subject</th>
                                    <th className="text-left p-3">Employee</th>
                                    <th className="text-left p-3">Technician</th>
                                    <th className="text-left p-3">Equipment/WC</th>
                                    <th className="text-left p-3">Stage</th>
                                    <th className="text-left p-3">Priority</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id} className="border-b hover:bg-accent/50 transition-smooth">
                                        <td className="p-3">
                                            <Link href={`/dashboard/requests`} className="hover:underline">
                                                {request.subject}
                                            </Link>
                                        </td>
                                        <td className="p-3 text-sm">{request.createdBy.name}</td>
                                        <td className="p-3 text-sm">
                                            {request.assignedTo?.name || (
                                                <span className="text-muted-foreground">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm">
                                            {request.equipment?.name || request.workCenter?.name || "-"}
                                        </td>
                                        <td className="p-3">
                                            <Badge className={getStatusColor(request.status)}>
                                                {request.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <Badge className={getPriorityColor(request.priority)}>
                                                {request.priority}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {formatDate(request.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {requests.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No requests found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/requests">
                    <Card className="card-hover cursor-pointer">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="p-3 rounded-lg bg-blue-500/10">
                                <Wrench className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">View Requests</h3>
                                <p className="text-sm text-muted-foreground">Kanban board</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/equipment">
                    <Card className="card-hover cursor-pointer">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="p-3 rounded-lg bg-purple-500/10">
                                <Package className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Equipment</h3>
                                <p className="text-sm text-muted-foreground">Manage assets</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/teams">
                    <Card className="card-hover cursor-pointer">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <Users className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Teams</h3>
                                <p className="text-sm text-muted-foreground">Manage teams</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
