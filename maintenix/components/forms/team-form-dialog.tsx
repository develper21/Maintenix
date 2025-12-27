"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TeamFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function TeamFormDialog({ open, onOpenChange, onSuccess }: TeamFormProps) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [formData, setFormData] = useState({
        name: "",
        teamType: "",
        teamLeadId: "",
    })

    useEffect(() => {
        if (open) {
            fetchUsers()
        }
    }, [open])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users")
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error("Error fetching users:", error)
        }
    }

    const handleAddMember = (userId: string) => {
        if (!selectedMembers.includes(userId)) {
            setSelectedMembers([...selectedMembers, userId])
        }
    }

    const handleRemoveMember = (userId: string) => {
        setSelectedMembers(selectedMembers.filter(id => id !== userId))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    memberIds: selectedMembers,
                }),
            })

            if (res.ok) {
                onSuccess()
                onOpenChange(false)
                // Reset form
                setFormData({
                    name: "",
                    teamType: "",
                    teamLeadId: "",
                })
                setSelectedMembers([])
            }
        } catch (error) {
            console.error("Error creating team:", error)
        } finally {
            setLoading(false)
        }
    }

    const getSelectedMemberNames = () => {
        return users.filter(u => selectedMembers.includes(u.id))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Maintenance Team</DialogTitle>
                    <DialogDescription>
                        Set up a new maintenance team with members
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Mechanics Team"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="teamType">Team Type *</Label>
                        <Select
                            value={formData.teamType}
                            onValueChange={(value) => setFormData({ ...formData, teamType: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select team type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Mechanical">Mechanical</SelectItem>
                                <SelectItem value="Electrical">Electrical</SelectItem>
                                <SelectItem value="IT">IT</SelectItem>
                                <SelectItem value="HVAC">HVAC</SelectItem>
                                <SelectItem value="Plumbing">Plumbing</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="teamLead">Team Lead</Label>
                        <Select
                            value={formData.teamLeadId}
                            onValueChange={(value) => setFormData({ ...formData, teamLeadId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select team lead" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.filter(u => u.role === "TECHNICIAN" || u.role === "MANAGER").map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Team Members</Label>
                        <Select onValueChange={handleAddMember}>
                            <SelectTrigger>
                                <SelectValue placeholder="Add team members" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.filter(u => !selectedMembers.includes(u.id)).map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {getSelectedMemberNames().map((user) => (
                                    <Badge key={user.id} variant="secondary" className="pl-3 pr-1">
                                        {user.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMember(user.id)}
                                            className="ml-2 hover:bg-muted rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Team"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
