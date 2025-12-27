"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import zxcvbn from "zxcvbn"

export default function SignupPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Password strength
    const passwordStrength = formData.password ? zxcvbn(formData.password) : null
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
    const strengthColors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-blue-500",
        "bg-green-500",
    ]

    // Password validation rules
    const hasMinLength = formData.password.length >= 8
    const hasUppercase = /[A-Z]/.test(formData.password)
    const hasLowercase = /[a-z]/.test(formData.password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""

    const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar

    // Email domain validation (portal-only)
    const isCompanyEmail = (email: string) => {
        const companyDomains = ["maintenix.com", "company.com"] // Add your company domains
        const domain = email.split("@")[1]
        return companyDomains.includes(domain)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation
        if (!isCompanyEmail(formData.email)) {
            setError("Only company email addresses are allowed. Please use your company email.")
            return
        }

        if (!isPasswordValid) {
            setError("Password does not meet the requirements")
            return
        }

        if (!passwordsMatch) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                // Redirect to login
                router.push("/login?registered=true")
            } else {
                setError(data.error || "Failed to create account") // Changed from setError
            }
        } catch {
            setError("An error occurred. Please try again.")
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
                        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    </div>
                    <CardDescription>
                        Sign up with your company email address
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Company Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                ⚠️ Only company email addresses are allowed
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>

                            {/* Password Strength Meter */}
                            {formData.password && passwordStrength && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded ${i <= passwordStrength.score
                                                    ? strengthColors[passwordStrength.score]
                                                    : "bg-muted"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Strength: {strengthLabels[passwordStrength.score]}
                                    </p>
                                </div>
                            )}

                            {/* Password Requirements */}
                            <div className="space-y-1 text-xs">
                                <div className={`flex items-center gap-2 ${hasMinLength ? "text-green-600" : "text-muted-foreground"}`}>
                                    {hasMinLength ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    At least 8 characters
                                </div>
                                <div className={`flex items-center gap-2 ${hasUppercase ? "text-green-600" : "text-muted-foreground"}`}>
                                    {hasUppercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    One uppercase letter
                                </div>
                                <div className={`flex items-center gap-2 ${hasLowercase ? "text-green-600" : "text-muted-foreground"}`}>
                                    {hasLowercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    One lowercase letter
                                </div>
                                <div className={`flex items-center gap-2 ${hasSpecialChar ? "text-green-600" : "text-muted-foreground"}`}>
                                    {hasSpecialChar ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    One special character
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Re-enter Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {formData.confirmPassword && (
                                <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                                    {passwordsMatch ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !isPasswordValid || !passwordsMatch}
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/login" className="text-primary hover:underline">
                                Sign In
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
