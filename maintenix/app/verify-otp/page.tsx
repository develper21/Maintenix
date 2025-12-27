"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Loader2 } from "lucide-react"
import Link from "next/link"

export default function VerifyOTPPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            })

            const data = await res.json()

            if (res.ok) {
                router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`)
            } else {
                setError(data.error || "Invalid OTP")
            }
        } catch {
            setError("Failed to verify OTP. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        setResending(true)
        setError("")

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (res.ok) {
                setError("")
                alert("New OTP sent to your email!")
            } else {
                setError("Failed to resend OTP")
            }
        } catch (error) {
            setError("Something went wrong")
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
            <Card className="w-full max-w-md glass">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/forgot-password">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
                    </div>
                    <CardDescription>
                        Enter the 6-digit code sent to <strong>{email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">One-Time Password</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                required
                                autoFocus
                                className="text-center text-2xl tracking-widest font-mono"
                                maxLength={6}
                            />
                            <p className="text-xs text-muted-foreground text-center">
                                OTP is valid for 10 minutes
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify OTP"
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                onClick={handleResendOTP}
                                disabled={resending}
                                className="text-sm text-primary hover:underline disabled:opacity-50">
                                {resending ? "Sending..." : "Didn&apos;t receive code? Resend"}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
