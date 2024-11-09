// pages/api/sponsors/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'
import { z } from 'zod'

const SponsorSchema = z.object({
  name: z.string(),
  initialContact: z.boolean(),
  initialPhoneCall: z.boolean(),
  dedicatedSpeakingSlot: z.string().nullable(),
  exhibitionSpace: z.string(),
  receivedProgrammeAdvert: z.boolean(),
  customsSupport: z.boolean(),
  bookedHotel: z.boolean(),
  numberOfAttendees: z.number(),
  attendeeNames: z.string(),
  contactEmail: z.string(),
  status: z.enum(['pending', 'confirmed', 'declined'])
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT * FROM sponsors 
        ORDER BY created_at DESC
      `
      return res.status(200).json(rows)
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching sponsors' })
    }
  }

  if (req.method === 'POST') {
    try {
      const sponsor = SponsorSchema.parse(req.body)
      
      const { rows } = await sql`
        INSERT INTO sponsors (
          name, 
          initial_contact, 
          initial_phone_call, 
          dedicated_speaking_slot,
          exhibition_space, 
          received_programme_advert, 
          customs_support,
          booked_hotel, 
          number_of_attendees, 
          attendee_names, 
          contact_email, 
          status
        ) VALUES (
          ${sponsor.name},
          ${sponsor.initialContact},
          ${sponsor.initialPhoneCall},
          ${sponsor.dedicatedSpeakingSlot},
          ${sponsor.exhibitionSpace},
          ${sponsor.receivedProgrammeAdvert},
          ${sponsor.customsSupport},
          ${sponsor.bookedHotel},
          ${sponsor.numberOfAttendees},
          ${sponsor.attendeeNames},
          ${sponsor.contactEmail},
          ${sponsor.status}
        )
        RETURNING *
      `
      
      return res.status(200).json(rows[0])
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues })
      }
      return res.status(500).json({ error: 'Error creating sponsor' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}