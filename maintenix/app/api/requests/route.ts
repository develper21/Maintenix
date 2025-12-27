import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth"
import { generateId } from "@/lib/utils"

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const teamId = searchParams.get("teamId")
        const equipmentId = searchParams.get("equipmentId")
        const type = searchParams.get("type")

        const where: Prisma.MaintenanceRequestWhereInput = {}
        if (status) where.status = status
        if (teamId) where.teamId = teamId
        if (equipmentId) where.equipmentId = equipmentId
        if (type) where.type = type

        const requests = await prisma.maintenanceRequest.findMany({
            where,
            include: {
                equipment: {
                    select: {
                        id: true,
                        name: true,
                        equipmentId: true,
                        category: true,
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(requests)
    } catch (error) {
        console.error("Error fetching requests:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const {
            subject,
            description,
            equipmentId,
            type,
            priority,
            scheduledDate,
            assignedToId,
        } = body

        const equipment = await prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                maintenanceTeam: true,
            }
        })

        if (!equipment) {
            return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
        }

        const requestId = generateId("REQ")

        const request = await prisma.maintenanceRequest.create({
            data: {
                requestId,
                subject,
                description,
                type,
                priority,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                equipmentId,
                teamId: equipment.maintenanceTeamId,
                assignedToId,
                createdById: (user as { id: string }).id,
            },
            include: {
                equipment: {
                    select: {
                        id: true,
                        name: true,
                        equipmentId: true,
                        category: true,
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })

        return NextResponse.json(request, { status: 201 })
    } catch (error) {
        console.error("Error creating request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
