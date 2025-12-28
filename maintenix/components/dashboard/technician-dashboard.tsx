"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardList, Calendar, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { getStatusColor, getPriorityColor, formatDate } from "@/lib/utils"

interface TechnicianDashboardProps {
    requests: any[]
}

export function TechnicianDashboard({ requests }: TechnicianDashboardProps) {
    // Filter requests assigned to the technician (mocking this filtering for now since we don't have the user ID passed down yet)
    // In real scenario: const myRequests = requests.filter(r => r.assignedTo?.id === userId)
    const myRequests = requests.slice(0, 5); // Just showing top 5 for demo

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Tasks</CardTitle>
                        <ClipboardList className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myRequests.filter(r => r.status !== 'REPAIRED').length}</div>
                        <p className="text-xs text-muted-foreground">Pending work orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Today</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Maintenance visits</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2h</div>
                        <p className="text-xs text-muted-foreground">Hours per task</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>My Work Orders</CardTitle>
                    <CardDescription>Tasks assigned to you</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-sm text-muted-foreground">
                                    <th className="text-left p-3">ID</th>
                                    <th className="text-left p-3">Subject</th>
                                    <th className="text-left p-3">Equipment</th>
                                    <th className="text-left p-3">Priority</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myRequests.map((request) => (
                                    <tr key={request.id} className="border-b hover:bg-accent/50 transition-smooth">
                                        <td className="p-3 text-sm font-medium">{request.requestId}</td>
                                        <td className="p-3">
                                            <span className="font-medium">{request.subject}</span>
                                        </td>
                                        <td className="p-3 text-sm">
                                            {request.equipment?.name || request.workCenter?.name || "-"}
                                        </td>
                                        <td className="p-3">
                                            <Badge className={getPriorityColor(request.priority)}>
                                                {request.priority}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <Badge className={getStatusColor(request.status)}>
                                                {request.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <Button size="sm" variant="outline">Start Work</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
