"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function CategoryFormDialog({ open, onOpenChange, onSuccess }: CategoryFormDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        responsibleId: "",
        company: "",
    })
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            fetchUsers()
        }
    }, [open])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users")
            const data = await res.json()
            setUsers(data)
        } catch (error) {
            console.error("Error fetching users:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/equipment-categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                onSuccess()
                onOpenChange(false)
                setFormData({ name: "", responsibleId: "", company: "" })
            }
        } catch (error) {
            console.error("Error creating category:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Equipment Category</DialogTitle>
                    <DialogDescription>
                        Add a new equipment category for classification
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Hydraulic Systems"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="responsible">Responsible Person</Label>
                        <Select
                            value={formData.responsibleId}
                            onValueChange={(value) => setFormData({ ...formData, responsibleId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select responsible person" />
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
                            {loading ? "Creating..." : "Create Category"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
