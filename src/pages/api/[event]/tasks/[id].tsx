import type { NextApiRequest, NextApiResponse } from 'next'
import {getEventModels} from '@/lib/prisma'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { event, id } = req.query
    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' })
    }
    if (typeof event !== 'string') {
        return res.status(400).json({ error: 'Invalid event' })
    }

    const { task: taskModel } = getEventModels(event)

    if (req.method === 'PATCH') {
        try {
            const task = await taskModel.update({
                where: { id },
                data: req.body
            })
            return res.status(200).json(task)
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update task' })
        }
    }

    if (req.method === 'DELETE') {
        try {
            await taskModel.delete({
                where: { id }
            })
            return res.status(200).json({ success: true })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete task' })
        }
    }

    res.status(405).json({ error: 'Method not allowed' })
}