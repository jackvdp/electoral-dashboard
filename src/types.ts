export type SponsorStatus = 'pending' | 'confirmed' | 'declined'

export interface Sponsor {
    id: string
    name: string
    initialContact: boolean
    exhibitionSpace: boolean
    specialRequirments: string
    receivedProgrammeAdvert: boolean
    bookedHotel: boolean
    numberOfAttendees: number
    attendeeNames: string | null
    contactEmail: string | null
    createdAt: Date
    updatedAt: Date
}