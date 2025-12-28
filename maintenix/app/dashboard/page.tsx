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

    // Initial role from session, but allow switching for testing/viewing
    const [currentRole, setCurrentRole] = useState("ADMIN")

    useEffect(() => {
        if (session?.user?.role) {
            setCurrentRole(session.user.role)
        }
    }, [session])

    useEffect(() => {
        fetchDashboardData()
    }, [])



    const fetchDashboardData = async () => {
        try {
            const [equipmentRes, requestsRes] = await Promise.all([
                fetch("/api/equipment"),
                fetch("/api/requests"),
            ])

            if (!equipmentRes.ok || !requestsRes.ok) {
                throw new Error("Failed to fetch dashboard data")
            }

            const equipment = await equipmentRes.json() as Array<{ healthPercentage?: number }>
            const allRequests = await requestsRes.json() as RequestRow[]

            const criticalEquipment = equipment.filter(
                (e) => (e.healthPercentage ?? 100) < 30
            ).length

            const activeRequests = allRequests.filter(
                (r) => r.status === "NEW" || r.status === "IN_PROGRESS"
            ).length

            const urgentRequests = allRequests.filter(
                (r) => r.priority === "URGENT"
            ).length

            const today = new Date().toDateString()
            const completedToday = allRequests.filter(
                (r) =>
                    r.status === "REPAIRED" &&
                    new Date(r.createdAt).toDateString() === today
            ).length

            const technicianLoad =
                equipment.length > 0
                    ? Math.min(
                        Math.round((activeRequests / equipment.length) * 100),
                        100
                    )
                    : 0

            setStats({
                totalEquipment: equipment.length,
                criticalEquipment,
                activeRequests,
                urgentRequests,
                completedToday,
                technicianLoad,
            })

            setRequests(allRequests.slice(0, 10))
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

    // Role is determined by state (which defaults to session role)
    const role = currentRole

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to MAINTENIX</p>
                </div>

                {/* Role Switcher for View Testing */}
                <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium whitespace-nowrap hidden md:block">View as:</span>
                    <Select value={currentRole} onValueChange={setCurrentRole}>
                        <SelectTrigger className="w-[140px] h-8 bg-background">
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="TECHNICIAN">Technician</SelectItem>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {role === "ADMIN" && <AdminDashboard stats={stats} requests={requests} />}
            {role === "MANAGER" && <AdminDashboard stats={stats} requests={requests} />}
            {role === "TECHNICIAN" && <TechnicianDashboard requests={requests} />}
            {role === "EMPLOYEE" && <EmployeeDashboard requests={requests} />}
        </div>
    )
}
