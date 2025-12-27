"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Wrench } from "lucide-react"
import { getStatusColor } from "@/lib/utils"
import type { EquipmentWithRelations } from "@/types"
import { EquipmentFormDialog } from "@/components/forms/equipment-form-dialog"
import { EquipmentDetailDialog } from "@/components/details/equipment-detail-dialog"

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<EquipmentWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)
    const [showDetailDialog, setShowDetailDialog] = useState(false)

    useEffect(() => {
        fetchEquipment()
    }, [])

    const fetchEquipment = async () => {
        try {
            const res = await fetch("/api/equipment")
            const data = await res.json()
            setEquipment(data)
        } catch (error) {
            console.error("Error fetching equipment:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCardClick = (equipmentId: string) => {
        setSelectedEquipmentId(equipmentId)
        setShowDetailDialog(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-lg">Loading equipment...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Equipment Management</h1>
                    <p className="text-muted-foreground">Manage all your equipment and assets</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Equipment
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.map((item) => (
                    <Card
                        key={item.id}
                        className="card-hover cursor-pointer"
                        onClick={() => handleCardClick(item.id)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">{item.equipmentId}</p>
                                </div>
                                <Badge className={getStatusColor(item.status)}>
                                    {item.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Category</p>
                                    <p className="font-medium">{item.category}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Department</p>
                                    <p className="font-medium">{item.department}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Location</p>
                                    <p className="font-medium">{item.location}</p>
                                </div>
                                {item.maintenanceTeam && (
                                    <div>
                                        <p className="text-muted-foreground">Team</p>
                                        <p className="font-medium">{item.maintenanceTeam.name}</p>
                                    </div>
                                )}
                            </div>

                            {item._count && item._count.requests > 0 && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleCardClick(item.id)
                                    }}
                                >
                                    <Wrench className="mr-2 h-4 w-4" />
                                    {item._count.requests} Open Request{item._count.requests !== 1 ? 's' : ''}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {equipment.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No equipment found. Add your first equipment to get started.</p>
                </div>
            )}

            <EquipmentFormDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={fetchEquipment}
            />

            {selectedEquipmentId && (
                <EquipmentDetailDialog
                    equipmentId={selectedEquipmentId}
                    open={showDetailDialog}
                    onOpenChange={setShowDetailDialog}
                    onUpdate={fetchEquipment}
                />
            )}
        </div>
    )
}
