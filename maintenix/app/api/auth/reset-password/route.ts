"use server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(request: NextRequest) {
    try {
        const { email, otp, newPassword } = await request.json()

        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { error: "Email, OTP, and new password are required" },
                { status: 400 }
            )
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            )
        }

        // Find the verified password reset request
        const resetRequest = await prisma.passwordReset.findFirst({
            where: {
                email,
                otp,
                verified: true,
                used: false,
            },
            include: {
                user: true,
            },
        })

        if (!resetRequest) {
            return NextResponse.json(
                { error: "Invalid or unverified OTP" },
                { status: 400 }
            )
        }

        // Check if OTP is expired
        if (new Date() > resetRequest.expiresAt) {
            return NextResponse.json(
                { error: "OTP has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 10)

        // Update user password
        await prisma.user.update({
            where: { id: resetRequest.userId },
            data: { password: hashedPassword },
        })

        // Mark reset request as used
        await prisma.passwordReset.update({
            where: { id: resetRequest.id },
            data: { used: true },
        })

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        })
    } catch (error) {
        console.error("Error resetting password:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
