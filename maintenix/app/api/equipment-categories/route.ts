import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { generateId } from "@/lib/utils"

export async function GET(_request: NextRequest) {
    try {
        const categories = await prisma.equipmentCategory.findMany({
            include: {
                responsible: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        equipment: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error("Error fetching categories:", error)
        return NextResponse.json(
            { error: "Failed to fetch categories" },
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

        const { name, responsibleId, company } = await request.json()

        if (!name) {
            return NextResponse.json(
                { error: "Category name is required" },
                { status: 400 }
            )
        }

        const existing = await prisma.equipmentCategory.findUnique({
            where: { name },
        })

        if (existing) {
            return NextResponse.json(
                { error: "Category with this name already exists" },
                { status: 400 }
            )
        }

        const category = await prisma.equipmentCategory.create({
            data: {
                name,
                responsibleId: responsibleId || null,
                company: company || user.company || null,
            },
            include: {
                responsible: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error("Error creating category:", error)
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        )
    }
}
