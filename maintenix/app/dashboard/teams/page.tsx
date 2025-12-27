"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { TeamWithMembers } from "@/types"
import { TeamFormDialog } from "@/components/forms/team-form-dialog"

export default function TeamsPage() {
    const [teams, setTeams] = useState<TeamWithMembers[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        try {
            const res = await fetch("/api/teams")
            const data = await res.json()
            setTeams(data)
        } catch (error) {
            console.error("Error fetching teams:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-lg">Loading teams...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Maintenance Teams</h1>
                    <p className="text-muted-foreground">Manage your maintenance teams and members</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Team
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                    <Card key={team.id} className="card-hover">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{team.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">{team.teamType}</p>
                                </div>
                                <Badge variant="secondary">
                                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {team.teamLead && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Team Lead</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                            {team.teamLead.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium">{team.teamLead.name}</span>
                                    </div>
                                </div>
                            )}

                            {team.members.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Members</p>
                                    <div className="space-y-2">
                                        {team.members.slice(0, 3).map((member) => (
                                            <div key={member.id} className="flex items-center gap-2 text-sm">
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                                    {member.user.name.charAt(0)}
                                                </div>
                                                <span>{member.user.name}</span>
                                            </div>
                                        ))}
                                        {team.members.length > 3 && (
                                            <p className="text-xs text-muted-foreground">
                                                +{team.members.length - 3} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {team._count && (
                                <div className="grid grid-cols-2 gap-2 pt-3 border-t text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Equipment</p>
                                        <p className="font-semibold">{team._count.equipment}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Requests</p>
                                        <p className="font-semibold">{team._count.requests}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {teams.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No teams found. Create your first team to get started.</p>
                </div>
            )}

            <TeamFormDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={fetchTeams}
            />
        </div>
    )
}
