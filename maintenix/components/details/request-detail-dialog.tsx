"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, User, Package, Clock, AlertCircle, Edit, Trash2 } from "lucide-react"
import { formatDate, formatDateTime, getStatusColor, getPriorityColor } from "@/lib/utils"
import { useState } from "react"

interface RequestDetailProps {
    request: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
}

export function RequestDetailDialog({ request, open, onOpenChange, onUpdate }: RequestDetailProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        status: request?.status || "",
        priority: request?.priority || "",
        duration: request?.duration || "",
    })
    const [loading, setLoading] = useState(false)

    if (!request) return null

    const handleUpdate = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/requests/${request.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            })

            if (res.ok) {
                onUpdate()
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Error updating request:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this request?")) return

        setLoading(true)
        try {
            const res = await fetch(`/api/requests/${request.id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                onUpdate()
                onOpenChange(false)
            }
        } catch (error) {
            console.error("Error deleting request:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl">{request.subject}</DialogTitle>
                            <DialogDescription className="mt-2">
                                Request ID: {request.requestId}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    {isEditing ? (
                                        <Select
                                            value={editData.status}
                                            onValueChange={(value) => setEditData({ ...editData, status: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NEW">New</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="REPAIRED">Repaired</SelectItem>
                                                <SelectItem value="SCRAP">Scrap</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge className={getStatusColor(request.status)}>
                                            {request.status}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    {isEditing ? (
                                        <Select
                                            value={editData.priority}
                                            onValueChange={(value) => setEditData({ ...editData, priority: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge className={getPriorityColor(request.priority)}>
                                            {request.priority}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Description */}
                    <Card>
                        <CardContent className="pt-6">
                            <Label className="mb-2 block">Description</Label>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                        </CardContent>
                    </Card>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <Label className="text-xs text-muted-foreground">Equipment</Label>
                                        <p className="font-medium">{request.equipment.name}</p>
                                        <p className="text-sm text-muted-foreground">{request.equipment.equipmentId}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <Label className="text-xs text-muted-foreground">Assigned To</Label>
                                        <p className="font-medium">
                                            {request.assignedTo?.name || "Unassigned"}
                                        </p>
                                        {request.assignedTo && (
                                            <p className="text-sm text-muted-foreground">{request.assignedTo.email}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <Label className="text-xs text-muted-foreground">Team</Label>
                                        <p className="font-medium">{request.team?.name || "Unassigned"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <Label className="text-xs text-muted-foreground">Type</Label>
                                        <Badge variant="outline">{request.type}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Dates and Duration */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <Label className="text-xs text-muted-foreground">Created</Label>
                                <p className="text-sm font-medium mt-1">{formatDateTime(request.createdAt)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    by {request.createdBy.name}
                                </p>
                            </CardContent>
                        </Card>

                        {request.scheduledDate && (
                            <Card>
                                <CardContent className="pt-6">
                                    <Label className="text-xs text-muted-foreground">Scheduled</Label>
                                    <p className="text-sm font-medium mt-1">{formatDate(request.scheduledDate)}</p>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Duration (Hours)</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            step="0.5"
                                            value={editData.duration}
                                            onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                                            placeholder="0"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium mt-1">
                                            {request.duration ? `${request.duration} hrs` : "Not logged"}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false)
                                    setEditData({
                                        status: request.status,
                                        priority: request.priority,
                                        duration: request.duration,
                                    })
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
