import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { generateId } from "@/lib/utils"

export async function GET(_request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const teams = await prisma.maintenanceTeam.findMany({
            include: {
                teamLead: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        equipment: true,
                        requests: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(teams)
    } catch (error) {
        console.error("Error fetching teams:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, teamType, teamLeadId, memberIds } = body

        const teamId = generateId("TEAM")

        const team = await prisma.maintenanceTeam.create({
            data: {
                teamId,
                name,
                teamType,
                teamLeadId,
                members: memberIds ? {
                    create: memberIds.map((userId: string) => ({
                        userId
                    }))
                } : undefined
            },
            include: {
                teamLead: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(team, { status: 201 })
    } catch (error) {
        console.error("Error creating team:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
