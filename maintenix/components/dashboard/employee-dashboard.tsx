"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, History } from "lucide-react"
import Link from "next/link"
import { getStatusColor, getPriorityColor, formatDate } from "@/lib/utils"

interface EmployeeDashboardProps {
    requests: any[]
}

export function EmployeeDashboard({ requests }: EmployeeDashboardProps) {
    // Filter requests created by employee
    const myRequests = requests.slice(0, 3);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">My Requests</h2>
                    <p className="text-sm text-muted-foreground">Track the status of your maintenance requests</p>
                </div>
                <Link href="/dashboard/requests/new">
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Request
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5 text-blue-600" />
                            Report Issue
                        </CardTitle>
                        <CardDescription>Something broken?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-4">Submit a new maintenance request for equipment or facilities.</p>
                        <Link href="/dashboard/requests/new">
                            <Button className="w-full">Create Request</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-500" />
                            Active Requests
                        </CardTitle>
                        <CardDescription>Currently in progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{myRequests.length}</div>
                        <p className="text-xs text-muted-foreground">Updates available</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-gray-500" />
                            Past Requests
                        </CardTitle>
                        <CardDescription>History</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">Total submitted</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-sm text-muted-foreground">
                                    <th className="text-left p-3">Request</th>
                                    <th className="text-left p-3">Equipment</th>
                                    <th className="text-left p-3">Submitted</th>
                                    <th className="text-left p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myRequests.map((request) => (
                                    <tr key={request.id} className="border-b hover:bg-accent/50 transition-smooth">
                                        <td className="p-3">
                                            <div className="font-medium">{request.subject}</div>
                                            <div className="text-xs text-muted-foreground">{request.requestId}</div>
                                        </td>
                                        <td className="p-3 text-sm">
                                            {request.equipment?.name || "-"}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="p-3">
                                            <Badge className={getStatusColor(request.status)}>
                                                {request.status}
                                            </Badge>
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
