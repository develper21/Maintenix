"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts"
import {
    TrendingUp,
    Wrench,
    CheckCircle,
    AlertTriangle,
    Package,
    Clock,
    Zap
} from "lucide-react"

interface DashboardStats {
    totalEquipment: number
    totalRequests: number
    activeRequests: number
    urgentRequests: number
    requestsByStatus: { status: string; count: number; color: string }[]
    requestsByTeam: { name: string; count: number }[]
    requestsByPriority: { priority: string; count: number; color: string }[]
    preventiveVsCorrective: { type: string; count: number; color: string }[]
    monthlyTrend: { month: string; requests: number }[]
}

export default function ReportsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const [requestsRes, equipmentRes] = await Promise.all([
                fetch("/api/requests"),
                fetch("/api/equipment"),
            ])

            const requests = await requestsRes.json() as any[]
            const equipment = await equipmentRes.json() as any[]

            const statusOrder = ["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP"]
            const statusColors: Record<string, string> = {
                NEW: "#3b82f6",
                IN_PROGRESS: "#eab308",
                REPAIRED: "#22c55e",
                SCRAP: "#ef4444",
            }
            const requestsByStatus = statusOrder.map(status => ({
                status,
                count: requests.filter(r => r.status === status).length,
                color: statusColors[status]
            }))

            const teamCounts: Record<string, number> = {}
            requests.forEach(req => {
                const teamName = req.assignedTo?.name || "Unassigned"
                teamCounts[teamName] = (teamCounts[teamName] || 0) + 1
            })
            const requestsByTeam = Object.entries(teamCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)

            const priorityOrder = ["LOW", "MEDIUM", "HIGH", "URGENT"]
            const priorityColors: Record<string, string> = {
                LOW: "#94a3b8",
                MEDIUM: "#3b82f6",
                HIGH: "#f97316",
                URGENT: "#ef4444",
            }
            const requestsByPriority = priorityOrder.map(priority => ({
                priority,
                count: requests.filter(r => r.priority === priority).length,
                color: priorityColors[priority]
            }))

            const preventiveVsCorrective = [
                { type: "PREVENTIVE", count: requests.filter(r => r.type === "PREVENTIVE").length, color: "#22c55e" },
                { type: "CORRECTIVE", count: requests.filter(r => r.type === "CORRECTIVE").length, color: "#ef4444" },
            ]

            const monthlyData: { month: string; requests: number }[] = []
            const now = new Date()
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const monthName = d.toLocaleString("default", { month: "short" })
                const count = requests.filter(r => {
                    const reqDate = new Date(r.createdAt)
                    return reqDate.getMonth() === d.getMonth() && reqDate.getFullYear() === d.getFullYear()
                }).length
                monthlyData.push({ month: monthName, requests: count })
            }

            setStats({
                totalEquipment: equipment.length,
                totalRequests: requests.length,
                activeRequests: requests.filter(r => r.status === "NEW" || r.status === "IN_PROGRESS").length,
                urgentRequests: requests.filter(r => r.priority === "URGENT").length,
                requestsByStatus,
                requestsByTeam,
                requestsByPriority,
                preventiveVsCorrective,
                monthlyTrend: monthlyData,
            })
        } catch (error) {
            console.error("Error fetching reports:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto animate-bounce" />
                    <p className="text-muted-foreground font-medium">Generating Intelligence Reports...</p>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="p-8 text-center text-red-500">
                Failed to load maintenance intelligence.
            </div>
        )
    }

    const statCards = [
        {
            title: "Total Assets",
            value: stats.totalEquipment,
            icon: Package,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Maintenance Volume",
            value: stats.totalRequests,
            icon: Wrench,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Live Operations",
            value: stats.activeRequests,
            icon: TrendingUp,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
        {
            title: "Critical Hazards",
            value: stats.urgentRequests,
            icon: AlertTriangle,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Maintenance Intelligence</h1>
                <p className="text-muted-foreground">Deep analytics and operational insights for MAINTENIX</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="glass border-none shadow-md overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bgColor} transition-transform group-hover:scale-110`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </CardContent>
                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Request Lifecycle Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.requestsByStatus}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: "rgba(17, 24, 39, 0.8)",
                                            backdropFilter: "blur(12px)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                        {stats.requestsByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Maintenance Strategy Split
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.preventiveVsCorrective}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="count">
                                        {stats.preventiveVsCorrective.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(17, 24, 39, 0.8)",
                                            backdropFilter: "blur(12px)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px"
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-none shadow-lg lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Maintenance Volume Trend (Last 6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(17, 24, 39, 0.8)",
                                            backdropFilter: "blur(12px)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px"
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="requests"
                                        stroke="#8b5cf6"
                                        strokeWidth={4}
                                        dot={{ r: 6, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Priority Distribution Triage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.requestsByPriority} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" axisLine={false} tickLine={false} hide />
                                    <YAxis dataKey="priority" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: "rgba(17, 24, 39, 0.8)",
                                            backdropFilter: "blur(12px)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px"
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                                        {stats.requestsByPriority.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Technician Workload Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {stats.requestsByTeam.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.requestsByTeam}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "rgba(17, 24, 39, 0.8)",
                                                backdropFilter: "blur(12px)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "12px"
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                                    No technician data recorded.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
