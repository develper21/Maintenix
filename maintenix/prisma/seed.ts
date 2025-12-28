
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('password123', 12)

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@maintenix.com' },
        update: {},
        create: {
            email: 'admin@maintenix.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
            company: 'Maintenix Inc',
        },
    })

    const manager = await prisma.user.upsert({
        where: { email: 'manager@maintenix.com' },
        update: {},
        create: {
            email: 'manager@maintenix.com',
            name: 'Manager User',
            password,
            role: 'MANAGER',
            company: 'Maintenix Inc',
        },
    })

    const technician = await prisma.user.upsert({
        where: { email: 'tech@maintenix.com' },
        update: {},
        create: {
            email: 'tech@maintenix.com',
            name: 'John Tech',
            password,
            role: 'TECHNICIAN',
            company: 'Maintenix Inc'
        },
    })

    const employee = await prisma.user.upsert({
        where: { email: 'employee@maintenix.com' },
        update: {},
        create: {
            email: 'employee@maintenix.com',
            name: 'Jane Employee',
            password,
            role: 'EMPLOYEE',
            company: 'Maintenix Inc'
        },
    })

    console.log({ admin, manager, technician, employee })

    // 2. Create Equipment Categories
    const heavyMachinery = await prisma.equipmentCategory.create({
        data: {
            name: 'Heavy Machinery',
            company: 'Maintenix Inc',
            responsibleId: manager.id
        }
    })

    // 3. Create Teams
    const maintenanceTeam = await prisma.maintenanceTeam.create({
        data: {
            teamId: 'TEAM-001',
            name: 'Alpha Team',
            teamType: 'MECHANICAL',
            company: 'Maintenix Inc',
            teamLeadId: manager.id,
            members: {
                create: {
                    userId: technician.id
                }
            }
        }
    })

    // 4. Create Equipment
    const excavator = await prisma.equipment.create({
        data: {
            equipmentId: 'EQ-100',
            name: 'Excavator X200',
            category: 'Heavy Machinery',
            department: 'Operations',
            location: 'Site A',
            categoryId: heavyMachinery.id,
            maintenanceTeamId: maintenanceTeam.id,
            defaultTechnicianId: technician.id,
        }
    })

    // 5. Create Requests
    // Request 1: Assigned to Technician
    await prisma.maintenanceRequest.create({
        data: {
            requestId: 'REQ-1001',
            subject: 'Hydraulic Leak',
            description: 'Oil leaking from main cylinder',
            type: 'CORRECTIVE',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            equipmentId: excavator.id,
            teamId: maintenanceTeam.id,
            assignedToId: technician.id,
            createdById: admin.id,
        }
    })

    // Request 2: Created by Employee
    await prisma.maintenanceRequest.create({
        data: {
            requestId: 'REQ-1002',
            subject: 'Strange Noise',
            description: 'Loud banging noise during operation',
            type: 'CORRECTIVE',
            priority: 'MEDIUM',
            status: 'NEW',
            equipmentId: excavator.id,
            teamId: maintenanceTeam.id,
            createdById: employee.id, // Created by employee, not yet assigned
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
