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
        const category = searchParams.get("category")

        const where: Prisma.EquipmentWhereInput = {}
        if (status) where.status = status
        if (category) where.category = category

        const equipment = await prisma.equipment.findMany({
            where,
            include: {
                maintenanceTeam: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                defaultTechnician: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                _count: {
                    select: {
                        requests: {
                            where: {
                                status: {
                                    in: ['NEW', 'IN_PROGRESS']
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(equipment)
    } catch (error) {
        console.error("Error fetching equipment:", error)
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
        const {
            name,
            serialNumber,
            category,
            department,
            assignedEmployee,
            location,
            purchaseDate,
            warrantyExpiry,
            maintenanceTeamId,
            defaultTechnicianId,
        } = body

        const equipmentId = generateId("EQP")

        const equipment = await prisma.equipment.create({
            data: {
                equipmentId,
                name,
                serialNumber,
                category,
                department,
                assignedEmployee,
                location,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
                maintenanceTeamId,
                defaultTechnicianId,
            },
            include: {
                maintenanceTeam: true,
                defaultTechnician: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return NextResponse.json(equipment, { status: 201 })
    } catch (error) {
        console.error("Error creating equipment:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
