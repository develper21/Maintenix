import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@maintenix.com' },
        update: {},
        create: {
            email: 'admin@maintenix.com',
            name: 'Admin User',
            password: await hash('password', 10),
            role: 'ADMIN',
        },
    })

    // Create technicians
    const tech1 = await prisma.user.upsert({
        where: { email: 'john@maintenix.com' },
        update: {},
        create: {
            email: 'john@maintenix.com',
            name: 'John Smith',
            password: await hash('password', 10),
            role: 'TECHNICIAN',
        },
    })

    const tech2 = await prisma.user.upsert({
        where: { email: 'sarah@maintenix.com' },
        update: {},
        create: {
            email: 'sarah@maintenix.com',
            name: 'Sarah Johnson',
            password: await hash('password', 10),
            role: 'TECHNICIAN',
        },
    })

    // Create teams
    const mechanicsTeam = await prisma.maintenanceTeam.upsert({
        where: { teamId: 'TEAM-MECH-001' },
        update: {},
        create: {
            teamId: 'TEAM-MECH-001',
            name: 'Mechanics Team',
            teamType: 'Mechanical',
            teamLeadId: tech1.id,
        },
    })

    const electricalTeam = await prisma.maintenanceTeam.upsert({
        where: { teamId: 'TEAM-ELEC-001' },
        update: {},
        create: {
            teamId: 'TEAM-ELEC-001',
            name: 'Electrical Team',
            teamType: 'Electrical',
            teamLeadId: tech2.id,
        },
    })

    // Add team members
    await prisma.teamMember.upsert({
        where: {
            userId_teamId: {
                userId: tech1.id,
                teamId: mechanicsTeam.id,
            }
        },
        update: {},
        create: {
            userId: tech1.id,
            teamId: mechanicsTeam.id,
        },
    })

    await prisma.teamMember.upsert({
        where: {
            userId_teamId: {
                userId: tech2.id,
                teamId: electricalTeam.id,
            }
        },
        update: {},
        create: {
            userId: tech2.id,
            teamId: electricalTeam.id,
        },
    })

    // Create equipment
    const equipment1 = await prisma.equipment.upsert({
        where: { equipmentId: 'EQP-001' },
        update: {},
        create: {
            equipmentId: 'EQP-001',
            name: 'CNC Machine #1',
            serialNumber: 'CNC-2024-001',
            category: 'Machine',
            department: 'Production',
            location: 'Factory Floor A',
            status: 'ACTIVE',
            maintenanceTeamId: mechanicsTeam.id,
            defaultTechnicianId: tech1.id,
        },
    })

    const equipment2 = await prisma.equipment.upsert({
        where: { equipmentId: 'EQP-002' },
        update: {},
        create: {
            equipmentId: 'EQP-002',
            name: 'Generator Unit',
            serialNumber: 'GEN-2024-002',
            category: 'Electrical',
            department: 'Utilities',
            location: 'Power Room',
            status: 'ACTIVE',
            maintenanceTeamId: electricalTeam.id,
            defaultTechnicianId: tech2.id,
        },
    })

    // Create maintenance requests
    await prisma.maintenanceRequest.create({
        data: {
            requestId: 'REQ-001',
            subject: 'CNC Machine Breakdown',
            description: 'Machine stopped working during production',
            type: 'CORRECTIVE',
            priority: 'URGENT',
            status: 'NEW',
            equipmentId: equipment1.id,
            teamId: mechanicsTeam.id,
            createdById: admin.id,
        },
    })

    await prisma.maintenanceRequest.create({
        data: {
            requestId: 'REQ-002',
            subject: 'Routine Generator Check',
            description: 'Monthly preventive maintenance',
            type: 'PREVENTIVE',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            equipmentId: equipment2.id,
            teamId: electricalTeam.id,
            assignedToId: tech2.id,
            createdById: admin.id,
        },
    })

    console.log('✅ Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
