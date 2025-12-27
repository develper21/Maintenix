"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
                }, 2000)
            } else {
                setError(data.error || "Failed to send OTP")
            }
        } catch {
            setError("Failed to send reset link. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
            <Card className="w-full max-w-md glass">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/login">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    </div>
                    <CardDescription>
                        Enter your email address and we&apos;ll send you an OTP to reset your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-4 py-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Mail className="h-8 w-8 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Check your email!</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    We&apos;ve sent a 6-digit OTP to <strong>{email}</strong>
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Redirecting to verification page...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-500">{error}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </Button>

                            <div className="text-center text-sm">
                                <Link href="/login" className="text-primary hover:underline">
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
