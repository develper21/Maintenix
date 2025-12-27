import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOTP, sendOTPEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { error: "No account found with this email" },
                { status: 404 }
            )
        }

        // Generate OTP
        const otp = generateOTP()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Delete any existing unused password reset requests for this user
        await prisma.passwordReset.deleteMany({
            where: {
                userId: user.id,
                used: false,
            },
        })

        // Create new password reset request
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                email: user.email,
                otp,
                expiresAt,
            },
        })

        // Send OTP email
        const emailResult = await sendOTPEmail(user.email, otp, user.name)

        if (!emailResult.success) {
            return NextResponse.json(
                { error: "Failed to send OTP email. Please try again." },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent to your email",
        })
    } catch (error) {
        console.error("Error in forgot password:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
