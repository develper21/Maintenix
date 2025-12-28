"use client"

import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { TechnicianDashboard } from "@/components/dashboard/technician-dashboard"
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { User } from "lucide-react"
import { useSession } from "next-auth/react"

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
    const { data: session } = useSession()

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
            const technicianLoad = equipment.length > 0 ? Math.min(Math.round((activeRequests / equipment.length) * 100), 100) : 0

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

    const role = session?.user?.role || "ADMIN"

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to MAINTENIX</p>
                </div>
            </div>

            {role === "ADMIN" && <AdminDashboard stats={stats} requests={requests} />}
            {role === "MANAGER" && <AdminDashboard stats={stats} requests={requests} />}
            {role === "TECHNICIAN" && <TechnicianDashboard requests={requests} />}
            {role === "EMPLOYEE" && <EmployeeDashboard requests={requests} />}
        </div>
    )
}
