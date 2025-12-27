"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface CalendarEvent {
    id: string
    requestId: string
    subject: string
    scheduledDate: string
    equipment: { name: string } | null
    assignedTo: { name: string } | null
    priority: string
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPreventiveRequests()
    }, [currentDate])

    const fetchPreventiveRequests = async () => {
        try {
            const res = await fetch("/api/requests?type=PREVENTIVE")
            const data = await res.json()
            const formattedEvents = data
                .filter((req: { scheduledDate?: string }) => req.scheduledDate)
                .map((req: { id: string; requestId: string; subject: string; scheduledDate: string; equipment: { name: string } | null; assignedTo: { name: string } | null; priority: string }) => ({
                    id: req.id,
                    requestId: req.requestId,
                    subject: req.subject,
                    scheduledDate: req.scheduledDate,
                    equipment: req.equipment,
                    assignedTo: req.assignedTo,
                    priority: req.priority,
                }))
            setEvents(formattedEvents)
        } catch (error) {
            console.error("Error fetching events:", error)
        } finally {
            setLoading(false)
        }
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        return { daysInMonth, startingDayOfWeek }
    }

    const getEventsForDate = (date: number) => {
        return events.filter((event) => {
            const eventDate = new Date(event.scheduledDate)
            return (
                eventDate.getDate() === date &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear()
            )
        })
    }

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
    const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-lg">Loading calendar...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Maintenance Calendar</h1>
                    <p className="text-muted-foreground">Scheduled preventive maintenance</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[200px] text-center">
                        <h2 className="text-lg font-semibold">{monthName}</h2>
                    </div>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekDays.map((day) => (
                            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                            <div key={`empty-${index}`} className="aspect-square" />
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, index) => {
                            const day = index + 1
                            const dayEvents = getEventsForDate(day)
                            const isToday =
                                day === new Date().getDate() &&
                                currentDate.getMonth() === new Date().getMonth() &&
                                currentDate.getFullYear() === new Date().getFullYear()

                            return (
                                <div
                                    key={day}
                                    className={`aspect-square border rounded-lg p-2 transition-smooth hover:bg-accent/50 ${isToday ? "border-primary bg-primary/5" : ""
                                        }`}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                                            {day}
                                        </div>
                                        <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                                            {dayEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="text-xs p-1 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 truncate cursor-pointer hover:bg-blue-500/20"
                                                    title={`${event.subject} - ${event.equipment?.name || "N/A"}`}
                                                >
                                                    <CalendarIcon className="h-3 w-3 inline mr-1" />
                                                    {event.subject}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming events list */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Preventive Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No scheduled preventive maintenance
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {events
                                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                                .slice(0, 5)
                                .map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-smooth"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-medium">{event.subject}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {event.equipment?.name || "N/A"} • {event.assignedTo?.name || "Unassigned"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline">{event.priority}</Badge>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(event.scheduledDate)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
