"use client"

import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, User, AlertCircle, Search, Filter } from "lucide-react"
import { formatDate, getPriorityColor } from "@/lib/utils"
import type { MaintenanceRequestWithRelations } from "@/types"
import { RequestFormDialog } from "@/components/forms/request-form-dialog"
import { RequestDetailDialog } from "@/components/details/request-detail-dialog"
import { toast } from "sonner"

const columns = [
    { id: "NEW", title: "New", color: "bg-blue-500" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-yellow-500" },
    { id: "REPAIRED", title: "Repaired", color: "bg-green-500" },
    { id: "SCRAP", title: "Scrap", color: "bg-red-500" },
]

export default function KanbanBoard() {
    const [requests, setRequests] = useState<MaintenanceRequestWithRelations[]>([])
    const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequestWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [showDetailDialog, setShowDetailDialog] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [priorityFilter, setPriorityFilter] = useState("ALL")
    const [typeFilter, setTypeFilter] = useState("ALL")

    useEffect(() => {
        fetchRequests()
    }, [])

    useEffect(() => {
        filterRequests()
    }, [requests, searchQuery, priorityFilter, typeFilter])

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/requests")
            const data = await res.json()
            setRequests(data)
        } catch (error) {
            console.error("Error fetching requests:", error)
            toast.error("Failed to load requests")
        } finally {
            setLoading(false)
        }
    }

    const filterRequests = () => {
        let filtered = requests

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(req =>
                req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.requestId.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Priority filter
        if (priorityFilter !== "ALL") {
            filtered = filtered.filter(req => req.priority === priorityFilter)
        }

        // Type filter
        if (typeFilter !== "ALL") {
            filtered = filtered.filter(req => req.type === typeFilter)
        }

        setFilteredRequests(filtered)
    }

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const newStatus = destination.droppableId

        // Optimistic update
        setRequests((prev) =>
            prev.map((req) =>
                req.id === draggableId ? { ...req, status: newStatus as any } : req
            )
        )

        // Update on server
        try {
            const res = await fetch(`/api/requests/${draggableId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                toast.success("Request status updated")
            } else {
                throw new Error("Failed to update")
            }
        } catch (error) {
            console.error("Error updating request:", error)
            toast.error("Failed to update request status")
            // Revert on error
            fetchRequests()
        }
    }

    const handleCardClick = (request: any) => {
        setSelectedRequest(request)
        setShowDetailDialog(true)
    }

    const getRequestsByStatus = (status: string) => {
        return filteredRequests.filter((req) => req.status === status)
    }

    const handleRequestCreated = () => {
        fetchRequests()
        toast.success("Request created successfully")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-lg">Loading requests...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Maintenance Requests</h1>
                    <p className="text-muted-foreground">Drag and drop to update status</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Request
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priorities</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                                <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {columns.map((column) => (
                        <div key={column.id} className="flex flex-col">
                            <div className="mb-3 flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${column.color}`} />
                                <h3 className="font-semibold">{column.title}</h3>
                                <Badge variant="secondary" className="ml-auto">
                                    {getRequestsByStatus(column.id).length}
                                </Badge>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 space-y-3 rounded-lg p-3 transition-smooth ${snapshot.isDraggingOver ? "bg-accent/50" : "bg-muted/20"
                                            } min-h-[200px]`}
                                    >
                                        {getRequestsByStatus(column.id).map((request, index) => (
                                            <Draggable
                                                key={request.id}
                                                draggableId={request.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => handleCardClick(request)}
                                                        className={`cursor-pointer transition-smooth ${snapshot.isDragging ? "shadow-lg rotate-2" : "card-hover"
                                                            }`}
                                                    >
                                                        <CardHeader className="p-4 pb-3">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <CardTitle className="text-sm font-semibold line-clamp-2">
                                                                    {request.subject}
                                                                </CardTitle>
                                                                <Badge className={getPriorityColor(request.priority)}>
                                                                    {request.priority}
                                                                </Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="p-4 pt-0 space-y-2">
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {request.description}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <AlertCircle className="h-3 w-3" />
                                                                {request.equipment?.name || request.workCenter?.name || "N/A"}
                                                            </div>
                                                            {request.assignedTo && (
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <User className="h-3 w-3" />
                                                                    {request.assignedTo.name}
                                                                </div>
                                                            )}
                                                            {request.scheduledDate && (
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {formatDate(request.scheduledDate)}
                                                                </div>
                                                            )}
                                                            <div className="pt-2 flex items-center justify-between">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {request.type}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {request.requestId}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <RequestFormDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={handleRequestCreated}
            />

            <RequestDetailDialog
                request={selectedRequest}
                open={showDetailDialog}
                onOpenChange={setShowDetailDialog}
                onUpdate={fetchRequests}
            />
        </div>
    )
}
