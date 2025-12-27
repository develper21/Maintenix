"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RequestFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function RequestFormDialog({ open, onOpenChange, onSuccess }: RequestFormDialogProps) {
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        maintenanceFor: "EQUIPMENT" as "EQUIPMENT" | "WORK_CENTER",
        equipmentId: "",
        workCenterId: "",
        type: "",
        priority: "MEDIUM",
        scheduledDate: "",
        assignedToId: "",
        worksheet: "",
        notes: "",
        instructions: "",
    })
    const [equipment, setEquipment] = useState<any[]>([])
    const [workCenters, setWorkCenters] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    const fetchData = async () => {
        try {
            const [equipmentRes, workCentersRes, usersRes] = await Promise.all([
                fetch("/api/equipment"),
                fetch("/api/work-centers"),
                fetch("/api/users"),
            ])

            const [equipmentData, workCentersData, usersData] = await Promise.all([
                equipmentRes.json(),
                workCentersRes.json(),
                usersRes.json(),
            ])

            setEquipment(equipmentData)
            setWorkCenters(workCentersData)
            setUsers(usersData)
        } catch (error) {
            console.error("Error fetching data:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                onSuccess()
                onOpenChange(false)
                setFormData({
                    subject: "",
                    description: "",
                    maintenanceFor: "EQUIPMENT",
                    equipmentId: "",
                    workCenterId: "",
                    type: "",
                    priority: "MEDIUM",
                    scheduledDate: "",
                    assignedToId: "",
                    worksheet: "",
                    notes: "",
                    instructions: "",
                })
            }
        } catch (error) {
            console.error("Error creating request:", error)
        } finally {
            setLoading(false)
        }
    }

    const technicians = users.filter(u => u.role === "TECHNICIAN" || u.role === "ADMIN")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Maintenance Request</DialogTitle>
                    <DialogDescription>
                        Create a new maintenance request for equipment or work center
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="notes">Notes & Instructions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Brief description of the issue"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed description of the maintenance request"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Maintenance For *</Label>
                                <Select
                                    value={formData.maintenanceFor}
                                    onValueChange={(value: "EQUIPMENT" | "WORK_CENTER") =>
                                        setFormData({ ...formData, maintenanceFor: value, equipmentId: "", workCenterId: "" })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                        <SelectItem value="WORK_CENTER">Work Center</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.maintenanceFor === "EQUIPMENT" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="equipmentId">Equipment *</Label>
                                    <Select
                                        value={formData.equipmentId}
                                        onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select equipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipment.map((eq) => (
                                                <SelectItem key={eq.id} value={eq.id}>
                                                    {eq.name} ({eq.equipmentId})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="workCenterId">Work Center *</Label>
                                    <Select
                                        value={formData.workCenterId}
                                        onValueChange={(value) => setFormData({ ...formData, workCenterId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select work center" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workCenters.map((wc) => (
                                                <SelectItem key={wc.id} value={wc.id}>
                                                    {wc.name} ({wc.workCenterId})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Maintenance Type *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                                            <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
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
                                </div>
                            </div>

                            {formData.type === "PREVENTIVE" && (
                                <div className="space-y-2">
                                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                                    <Input
                                        id="scheduledDate"
                                        type="date"
                                        value={formData.scheduledDate}
                                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                    />
                                </div>
                            )}

                            {formData.type === "CORRECTIVE" && (
                                <div className="space-y-2">
                                    <Label htmlFor="assignedToId">Assign To</Label>
                                    <Select
                                        value={formData.assignedToId}
                                        onValueChange={(value) => setFormData({ ...formData, assignedToId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select technician" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {technicians.map((tech) => (
                                                <SelectItem key={tech.id} value={tech.id}>
                                                    {tech.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="worksheet">Worksheet</Label>
                                <Textarea
                                    id="worksheet"
                                    value={formData.worksheet}
                                    onChange={(e) => setFormData({ ...formData, worksheet: e.target.value })}
                                    placeholder="Work details, parts used, time spent..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes or observations..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea
                                    id="instructions"
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    placeholder="Maintenance instructions or procedures..."
                                    rows={3}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Request"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
