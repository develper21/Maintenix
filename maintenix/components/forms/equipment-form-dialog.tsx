"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EquipmentFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function EquipmentFormDialog({ open, onOpenChange, onSuccess }: EquipmentFormDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        serialNumber: "",
        categoryId: "",
        department: "",
        location: "",
        assignedEmployeeId: "",
        purchaseDate: "",
        warrantyExpiry: "",
        maintenanceTeamId: "",
        defaultTechnicianId: "",
        healthPercentage: "100",
        company: "",
    })
    const [categories, setCategories] = useState<any[]>([])
    const [teams, setTeams] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    const fetchData = async () => {
        try {
            const [categoriesRes, teamsRes, usersRes] = await Promise.all([
                fetch("/api/equipment-categories"),
                fetch("/api/teams"),
                fetch("/api/users"),
            ])

            const [categoriesData, teamsData, usersData] = await Promise.all([
                categoriesRes.json(),
                teamsRes.json(),
                usersRes.json(),
            ])

            setCategories(categoriesData)
            setTeams(teamsData)
            setUsers(usersData)
        } catch (error) {
            console.error("Error fetching data:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/equipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                onSuccess()
                onOpenChange(false)
                setFormData({
                    name: "",
                    serialNumber: "",
                    categoryId: "",
                    department: "",
                    location: "",
                    assignedEmployeeId: "",
                    purchaseDate: "",
                    warrantyExpiry: "",
                    maintenanceTeamId: "",
                    defaultTechnicianId: "",
                    healthPercentage: "100",
                    company: "",
                })
            }
        } catch (error) {
            console.error("Error creating equipment:", error)
        } finally {
            setLoading(false)
        }
    }

    const departments = ["Production", "Utilities", "IT", "Admin", "Warehouse", "Maintenance"]
    const technicians = users.filter(u => u.role === "TECHNICIAN" || u.role === "ADMIN")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Equipment</DialogTitle>
                    <DialogDescription>
                        Create a new equipment entry with all details
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Equipment Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., CNC Machine 01"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serialNumber">Serial Number</Label>
                            <Input
                                id="serialNumber"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                placeholder="e.g., SN-2024-001"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Equipment Category *</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department *</Label>
                            <Select
                                value={formData.department}
                                onValueChange={(value) => setFormData({ ...formData, department: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Building A, Floor 2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assignedEmployeeId">Assigned Employee</Label>
                            <Select
                                value={formData.assignedEmployeeId}
                                onValueChange={(value) => setFormData({ ...formData, assignedEmployeeId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="purchaseDate">Purchase Date</Label>
                            <Input
                                id="purchaseDate"
                                type="date"
                                value={formData.purchaseDate}
                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                            <Input
                                id="warrantyExpiry"
                                type="date"
                                value={formData.warrantyExpiry}
                                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maintenanceTeamId">Maintenance Team</Label>
                            <Select
                                value={formData.maintenanceTeamId}
                                onValueChange={(value) => setFormData({ ...formData, maintenanceTeamId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="defaultTechnicianId">Default Technician</Label>
                            <Select
                                value={formData.defaultTechnicianId}
                                onValueChange={(value) => setFormData({ ...formData, defaultTechnicianId: value })}
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="healthPercentage">Health Percentage (%)</Label>
                            <Input
                                id="healthPercentage"
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={formData.healthPercentage}
                                onChange={(e) => setFormData({ ...formData, healthPercentage: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Equipment health status (0-100%)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Company name"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Equipment"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
