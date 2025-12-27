import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { generateId } from "@/lib/utils"

export async function GET(_request: NextRequest) {
    try {
        const workCenters = await prisma.workCenter.findMany({
            include: {
                _count: {
                    select: {
                        requests: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        })

        return NextResponse.json(workCenters)
    } catch (error) {
        console.error("Error fetching work centers:", error)
        return NextResponse.json(
            { error: "Failed to fetch work centers" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const {
            name,
            code,
            tag,
            costPerHour,
            capacityTimeEfficiency,
            oeeTarget,
            alternativeWorkCenters,
            company,
        } = await request.json()

        if (!name) {
            return NextResponse.json(
                { error: "Work center name is required" },
                { status: 400 }
            )
        }

        // Generate unique work center ID
        const workCenterId = generateId("WC")

        const workCenter = await prisma.workCenter.create({
            data: {
                workCenterId,
                name,
                code: code || null,
                tag: tag || null,
                costPerHour: costPerHour ? parseFloat(costPerHour) : null,
                capacityTimeEfficiency: capacityTimeEfficiency ? parseFloat(capacityTimeEfficiency) : null,
                oeeTarget: oeeTarget ? parseFloat(oeeTarget) : null,
                alternativeWorkCenters: alternativeWorkCenters || null,
                company: company || user.company || null,
            },
        })

        return NextResponse.json(workCenter)
    } catch (error) {
        console.error("Error creating work center:", error)
        return NextResponse.json(
            { error: "Failed to create work center" },
            { status: 500 }
        )
    }
}
