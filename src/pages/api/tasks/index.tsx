import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const tasks = await prisma.task.findMany({
                orderBy: [
                    { section: 'asc' },
                    { order: 'asc' }
                ]
            })
            return res.status(200).json(tasks)
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch tasks' })
        }
    }

    if (req.method === 'POST') {
        try {
            const task = await prisma.task.create({
                data: req.body
            })
            return res.status(200).json(task)
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create task' })
        }
    }

    res.status(405).json({ error: 'Method not allowed' })
}