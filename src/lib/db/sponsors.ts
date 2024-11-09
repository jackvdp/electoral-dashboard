import { sql } from '@vercel/postgres';
import { Sponsor } from '@/types';

export async function createSponsorsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS sponsors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        initial_contact BOOLEAN DEFAULT false,
        initial_phone_call BOOLEAN DEFAULT false,
        dedicated_speaking_slot VARCHAR(255),
        exhibition_space VARCHAR(255),
        received_programme_advert BOOLEAN DEFAULT false,
        customs_support BOOLEAN DEFAULT false,
        booked_hotel BOOLEAN DEFAULT false,
        number_of_attendees INTEGER DEFAULT 0,
        attendee_names TEXT,
        contact_email TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Sponsors table created successfully');
  } catch (error) {
    console.error('Error creating sponsors table:', error);
    throw error;
  }
}