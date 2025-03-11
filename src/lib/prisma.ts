/* eslint-disable @typescript-eslint/ban-ts-comment */
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

interface PrismaClientWithSchemas extends PrismaClient {
    // @ts-ignore
    dominicanTask: PrismaClient['task']
    // @ts-ignore
    dominicanSponsor: PrismaClient['sponsor']
    // @ts-ignore
    botswanaTask: PrismaClient['task']
    // @ts-ignore
    botswanaSponsor: PrismaClient['sponsor']
}

const globalForPrisma = global as unknown as {
    prisma: PrismaClientWithSchemas | undefined
}

// Cast PrismaClient to our extended type
const prisma = (globalForPrisma.prisma ??
    new PrismaClient({
        log: ['error'],
    })) as PrismaClientWithSchemas

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add a helper function to get event models
export function getEventModels(event: string) {
    switch(event) {
        case 'dominican-republic':
            return {
                task: prisma.dominicanTask,
                sponsor: prisma.dominicanSponsor
            }
        case 'botswana':
            return {
                task: prisma.botswanaTask,
                sponsor: prisma.botswanaSponsor
            }
        default:
            throw new Error(`Invalid event: ${event}`)
    }
}

// List of valid events
export const VALID_EVENTS = ['dominican-republic', 'botswana']