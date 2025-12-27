import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { status, assignedToId, duration } = body

        const updateData: Prisma.MaintenanceRequestUpdateInput = {}
        if (status) updateData.status = status
        if (assignedToId !== undefined) updateData.assignedToId = assignedToId
        if (duration !== undefined) updateData.duration = duration as number

        // If status is SCRAP, update equipment status
        if (status === 'SCRAP') {
            const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
                where: { id },
                select: { equipmentId: true }
            })

            if (maintenanceRequest) {
                await prisma.equipment.update({
                    where: { id: maintenanceRequest.equipmentId },
                    data: {
                        status: 'SCRAPPED',
                        scrapNote: `Scrapped via request ${id}`
                    }
                })
            }
        }

        const updatedRequest = await prisma.maintenanceRequest.update({
            where: { id },
            data: updateData,
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

        return NextResponse.json(updatedRequest)
    } catch (error) {
        console.error("Error updating request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
