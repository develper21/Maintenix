"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WorkCenterFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function WorkCenterFormDialog({ open, onOpenChange, onSuccess }: WorkCenterFormDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        tag: "",
        costPerHour: "",
        capacityTimeEfficiency: "",
        oeeTarget: "",
        alternativeWorkCenters: "",
        company: "",
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/work-centers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                onSuccess()
                onOpenChange(false)
                setFormData({
                    name: "",
                    code: "",
                    tag: "",
                    costPerHour: "",
                    capacityTimeEfficiency: "",
                    oeeTarget: "",
                    alternativeWorkCenters: "",
                    company: "",
                })
            }
        } catch (error) {
            console.error("Error creating work center:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Work Center</DialogTitle>
                    <DialogDescription>
                        Add a new work center for maintenance operations
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Work Center Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Assembly Line 1"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g., WC-001"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tag">Tag</Label>
                            <Input
                                id="tag"
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                placeholder="e.g., Production"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="costPerHour">Cost per Hour ($)</Label>
                            <Input
                                id="costPerHour"
                                type="number"
                                step="0.01"
                                value={formData.costPerHour}
                                onChange={(e) => setFormData({ ...formData, costPerHour: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capacityTimeEfficiency">Capacity Time Efficiency (%)</Label>
                            <Input
                                id="capacityTimeEfficiency"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={formData.capacityTimeEfficiency}
                                onChange={(e) => setFormData({ ...formData, capacityTimeEfficiency: e.target.value })}
                                placeholder="0-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="oeeTarget">OEE Target (%)</Label>
                            <Input
                                id="oeeTarget"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={formData.oeeTarget}
                                onChange={(e) => setFormData({ ...formData, oeeTarget: e.target.value })}
                                placeholder="0-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="alternativeWorkCenters">Alternative Work Centers</Label>
                        <Input
                            id="alternativeWorkCenters"
                            value={formData.alternativeWorkCenters}
                            onChange={(e) => setFormData({ ...formData, alternativeWorkCenters: e.target.value })}
                            placeholder="Comma-separated work center names"
                        />
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

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Work Center"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
