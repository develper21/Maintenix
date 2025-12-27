"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, User } from "lucide-react"
import { CategoryFormDialog } from "@/components/forms/category-form-dialog"

interface Category {
    id: string
    name: string
    company: string | null
    responsible: {
        id: string
        name: string
        email: string
    } | null
    _count: {
        equipment: number
    }
}

export default function EquipmentCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/equipment-categories")
            const data = await res.json()
            setCategories(data)
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-lg">Loading categories...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Equipment Categories</h1>
                    <p className="text-muted-foreground">Manage equipment categories and responsibilities</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Card key={category.id} className="card-hover">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{category.name}</CardTitle>
                                    {category.company && (
                                        <p className="text-sm text-muted-foreground mt-1">{category.company}</p>
                                    )}
                                </div>
                                <Badge variant="secondary">
                                    {category._count.equipment} equipment
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {category.responsible && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{category.responsible.name}</p>
                                        <p className="text-xs text-muted-foreground">{category.responsible.email}</p>
                                    </div>
                                </div>
                            )}
                            {!category.responsible && (
                                <p className="text-sm text-muted-foreground">No responsible assigned</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
                </div>
            )}

            <CategoryFormDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={fetchCategories}
            />
        </div>
    )
}
