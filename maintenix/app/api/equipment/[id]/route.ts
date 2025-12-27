import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const equipment = await prisma.equipment.findUnique({
            where: { id: params.id },
            include: {
                maintenanceTeam: true,
                defaultTechnician: true,
                requests: {
                    include: {
                        assignedTo: true,
                        createdBy: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        })

        if (!equipment) {
            return NextResponse.json(
                { error: "Equipment not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(equipment)
    } catch (error) {
        console.error("Error fetching equipment:", error)
        return NextResponse.json(
            { error: "Failed to fetch equipment" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.equipment.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting equipment:", error)
        return NextResponse.json(
            { error: "Failed to delete equipment" },
            { status: 500 }
        )
    }
}
