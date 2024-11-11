import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    console.log("GET sponsors")
    try {
      const sponsors = await prisma.sponsor.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return res.status(200).json(sponsors)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch sponsors' })
    }
  }

  if (req.method === 'POST') {
    try {
      const sponsor = await prisma.sponsor.create({
        data: req.body
      })
      return res.status(200).json(sponsor)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create sponsor' })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}