export type { User, Equipment, MaintenanceTeam, MaintenanceRequest, TeamMember } from '@prisma/client'

export type Role = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'USER'
export type EquipmentStatus = 'ACTIVE' | 'UNDER_MAINTENANCE' | 'SCRAPPED'
export type RequestType = 'CORRECTIVE' | 'PREVENTIVE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'REPAIRED' | 'SCRAP'

export interface EquipmentWithRelations {
    id: string
    equipmentId: string
    name: string
    serialNumber?: string | null
    category: string
    department: string
    assignedEmployee?: string | null
    location: string
    purchaseDate?: Date | null
    warrantyExpiry?: Date | null
    status: EquipmentStatus
    scrapNote?: string | null
    maintenanceTeam?: {
        id: string
        name: string
    } | null
    defaultTechnician?: {
        id: string
        name: string
    } | null
    _count?: {
        requests: number
    }
}

export interface MaintenanceRequestWithRelations {
    workCenter: any
    id: string
    requestId: string
    subject: string
    description: string
    type: RequestType
    priority: Priority
    status: RequestStatus
    scheduledDate?: Date | null
    duration?: number | null
    createdAt: Date
    updatedAt: Date
    equipment: {
        id: string
        name: string
        equipmentId: string
        category: string
    }
    team?: {
        id: string
        name: string
    } | null
    assignedTo?: {
        id: string
        name: string
        email: string
    } | null
    createdBy: {
        id: string
        name: string
        email: string
    }
}

export interface TeamWithMembers {
    id: string
    teamId: string
    name: string
    teamType: string
    teamLead?: {
        id: string
        name: string
    } | null
    members: {
        id: string
        user: {
            id: string
            name: string
            email: string
        }
    }[]
    _count?: {
        equipment: number
        requests: number
    }
}

export interface DashboardStats {
    totalEquipment: number
    activeRequests: number
    completedToday: number
    urgentRequests: number
    requestsByStatus: {
        status: RequestStatus
        count: number
    }[]
    requestsByTeam: {
        teamName: string
        count: number
    }[]
    preventiveVsCorrective: {
        type: RequestType
        count: number
    }[]
}
