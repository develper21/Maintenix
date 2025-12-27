import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(d)
}

export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(d)
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        NEW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        REPAIRED: 'bg-green-500/10 text-green-500 border-green-500/20',
        SCRAP: 'bg-red-500/10 text-red-500 border-red-500/20',
        ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
        UNDER_MAINTENANCE: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        SCRAPPED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    }
    return colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
}

export function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        LOW: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        MEDIUM: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        URGENT: 'bg-red-500/10 text-red-500 border-red-500/20',
    }
    return colors[priority] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
}

export function generateId(prefix: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 7)
    return `${prefix}-${timestamp}-${random}`.toUpperCase()
}
