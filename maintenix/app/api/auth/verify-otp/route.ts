import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            )
        }

        // Find the password reset request
        const resetRequest = await prisma.passwordReset.findFirst({
            where: {
                email,
                otp,
                used: false,
                verified: false,
            },
        })

        if (!resetRequest) {
            return NextResponse.json(
                { error: "Invalid OTP" },
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

        // Mark OTP as verified
        await prisma.passwordReset.update({
            where: { id: resetRequest.id },
            data: { verified: true },
        })

        return NextResponse.json({
            success: true,
            message: "OTP verified successfully",
            resetId: resetRequest.id,
        })
    } catch (error) {
        console.error("Error verifying OTP:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
