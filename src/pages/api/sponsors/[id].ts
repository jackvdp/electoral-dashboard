// pages/api/sponsors/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'PATCH') {
    try {
      const updates = req.body
      
      // Build the SET part of the query safely
      const setValues: string[] = []
      const values: any[] = []
      let paramCount = 1

      Object.entries(updates).forEach(([key, value]) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        setValues.push(`${snakeKey} = $${paramCount}`)
        values.push(value)
        paramCount++
      })

      // Add updated_at timestamp
      setValues.push(`updated_at = CURRENT_TIMESTAMP`)

      const queryText = `
        UPDATE sponsors 
        SET ${setValues.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `
      values.push(id)

      const { rows } = await sql.query(queryText, values)
      
      if (!rows.length) {
        return res.status(404).json({ error: 'Sponsor not found' })
      }
      
      return res.status(200).json(rows[0])
    } catch (error) {
      console.error('Error updating sponsor:', error)
      return res.status(500).json({ error: 'Error updating sponsor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { rows } = await sql`
        DELETE FROM sponsors 
        WHERE id = ${id}
        RETURNING id
      `
      
      if (!rows.length) {
        return res.status(404).json({ error: 'Sponsor not found' })
      }
      
      return res.status(200).json({ success: true })
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting sponsor' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}