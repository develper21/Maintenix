"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Target } from "lucide-react"
import { WorkCenterFormDialog } from "@/components/forms/workcenter-form-dialog"

interface WorkCenter {
    id: string
    workCenterId: string
    name: string
    code: string | null
    tag: string | null
    costPerHour: number | null
    capacityTimeEfficiency: number | null
    oeeTarget: number | null
    company: string | null
    _count: {
        requests: number
    }
}

export default function WorkCentersPage() {
    const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    useEffect(() => {
        fetchWorkCenters()
    }, [])

    const fetchWorkCenters = async () => {
        try {
            const res = await fetch("/api/work-centers")
            const data = await res.json()
            setWorkCenters(data)
        } catch (error) {
            console.error("Error fetching work centers:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-lg">Loading work centers...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Work Centers</h1>
                    <p className="text-muted-foreground">Manage work centers and production efficiency</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Work Center
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workCenters.map((wc) => (
                    <Card key={wc.id} className="card-hover">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{wc.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">{wc.workCenterId}</p>
                                </div>
                                {wc._count.requests > 0 && (
                                    <Badge variant="secondary">
                                        {wc._count.requests} requests
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {wc.code && (
                                    <div>
                                        <p className="text-muted-foreground">Code</p>
                                        <p className="font-medium">{wc.code}</p>
                                    </div>
                                )}
                                {wc.tag && (
                                    <div>
                                        <p className="text-muted-foreground">Tag</p>
                                        <Badge variant="outline">{wc.tag}</Badge>
                                    </div>
                                )}
                            </div>

                            {(wc.costPerHour || wc.capacityTimeEfficiency || wc.oeeTarget) && (
                                <div className="pt-3 border-t space-y-2">
                                    {wc.costPerHour && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Cost/Hour</span>
                                            <span className="font-medium">${wc.costPerHour}</span>
                                        </div>
                                    )}
                                    {wc.capacityTimeEfficiency && (
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">Efficiency</span>
                                            </div>
                                            <span className="font-medium">{wc.capacityTimeEfficiency}%</span>
                                        </div>
                                    )}
                                    {wc.oeeTarget && (
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <Target className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">OEE Target</span>
                                            </div>
                                            <span className="font-medium">{wc.oeeTarget}%</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {workCenters.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No work centers found. Create your first work center to get started.</p>
                </div>
            )}

            <WorkCenterFormDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={fetchWorkCenters}
            />
        </div>
    )
}
