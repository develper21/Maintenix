"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, MapPin, Calendar, Users, Wrench, Edit, Trash2, AlertCircle } from "lucide-react"
import { formatDate, getStatusColor } from "@/lib/utils"
import { useState, useEffect } from "react"

interface EquipmentDetailProps {
    equipmentId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
}

export function EquipmentDetailDialog({ equipmentId, open, onOpenChange, onUpdate }: EquipmentDetailProps) {
    const [equipment, setEquipment] = useState<any>(null)
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (open && equipmentId) {
            fetchEquipmentDetails()
        }
    }, [open, equipmentId])

    const fetchEquipmentDetails = async () => {
        setLoading(true)
        try {
            const [equipRes, reqRes] = await Promise.all([
                fetch(`/api/equipment/${equipmentId}`),
                fetch(`/api/requests?equipmentId=${equipmentId}`),
            ])

            if (equipRes.ok) {
                const equipData = await equipRes.json()
                setEquipment(equipData)
            }

            if (reqRes.ok) {
                const reqData = await reqRes.json()
                setRequests(reqData)
            }
        } catch (error) {
            console.error("Error fetching equipment details:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this equipment?")) return

        try {
            const res = await fetch(`/api/equipment/${equipmentId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                onUpdate()
                onOpenChange(false)
            }
        } catch (error) {
            console.error("Error deleting equipment:", error)
        }
    }

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-pulse text-lg">Loading equipment details...</div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (!equipment) return null

    const activeRequests = requests.filter(r => r.status === "NEW" || r.status === "IN_PROGRESS")
    const completedRequests = requests.filter(r => r.status === "REPAIRED")
    const scrappedRequests = requests.filter(r => r.status === "SCRAP")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl">{equipment.name}</DialogTitle>
                            <DialogDescription className="mt-2">
                                Equipment ID: {equipment.equipmentId}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Basic Info */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <Badge className={`${getStatusColor(equipment.status)} mt-2`}>
                                    {equipment.status}
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <Label className="text-xs text-muted-foreground">Category</Label>
                                <p className="font-medium mt-2">{equipment.category}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <Label className="text-xs text-muted-foreground">Department</Label>
                                <p className="font-medium mt-2">{equipment.department}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <Label className="text-xs text-muted-foreground">Location</Label>
                                        <p className="font-medium mt-1">{equipment.location}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {equipment.serialNumber && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Serial Number</Label>
                                            <p className="font-medium mt-1">{equipment.serialNumber}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {equipment.assignedEmployee && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Assigned Employee</Label>
                                            <p className="font-medium mt-1">{equipment.assignedEmployee}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {equipment.maintenanceTeam && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Maintenance Team</Label>
                                            <p className="font-medium mt-1">{equipment.maintenanceTeam.name}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Dates */}
                    {(equipment.purchaseDate || equipment.warrantyExpiry) && (
                        <div className="grid grid-cols-2 gap-4">
                            {equipment.purchaseDate && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <Label className="text-xs text-muted-foreground">Purchase Date</Label>
                                                <p className="font-medium mt-1">{formatDate(equipment.purchaseDate)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {equipment.warrantyExpiry && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <Label className="text-xs text-muted-foreground">Warranty Expiry</Label>
                                                <p className="font-medium mt-1">{formatDate(equipment.warrantyExpiry)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Scrap Note */}
                    {equipment.scrapNote && (
                        <Card className="border-red-500/20 bg-red-500/5">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                        <Label className="text-xs text-red-600 dark:text-red-400">Scrap Note</Label>
                                        <p className="text-sm mt-1">{equipment.scrapNote}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Maintenance History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Maintenance History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 rounded-lg bg-blue-500/10">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {activeRequests.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Active</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-green-500/10">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {completedRequests.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Completed</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-red-500/10">
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {scrappedRequests.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Scrapped</p>
                                </div>
                            </div>

                            {requests.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {requests.slice(0, 10).map((req) => (
                                        <div
                                            key={req.id}
                                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-smooth"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{req.subject}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(req.createdAt)} • {req.type}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(req.status)}>
                                                {req.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No maintenance history
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`text-sm font-medium ${className}`}>{children}</div>
}
