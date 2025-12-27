import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'USER']),
})

export const equipmentSchema = z.object({
    equipmentId: z.string().min(1, 'Equipment ID is required'),
    name: z.string().min(1, 'Name is required'),
    serialNumber: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    department: z.string().min(1, 'Department is required'),
    assignedEmployee: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    purchaseDate: z.string().optional(),
    warrantyExpiry: z.string().optional(),
    maintenanceTeamId: z.string().optional(),
    defaultTechnicianId: z.string().optional(),
})

export const teamSchema = z.object({
    teamId: z.string().min(1, 'Team ID is required'),
    name: z.string().min(1, 'Name is required'),
    teamType: z.string().min(1, 'Team type is required'),
    teamLeadId: z.string().optional(),
    memberIds: z.array(z.string()).optional(),
})

export const requestSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().min(1, 'Description is required'),
    equipmentId: z.string().min(1, 'Equipment is required'),
    type: z.enum(['CORRECTIVE', 'PREVENTIVE']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    scheduledDate: z.string().optional(),
    assignedToId: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EquipmentInput = z.infer<typeof equipmentSchema>
export type TeamInput = z.infer<typeof teamSchema>
export type RequestInput = z.infer<typeof requestSchema>
