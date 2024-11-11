export type SponsorStatus = 'pending' | 'confirmed' | 'declined'

export interface Sponsor {
    id: string
    name: string
    initialContact: boolean
    exhibitionSpace: boolean
    specialRequirments: string
    advertInProgramme: boolean
    bookedHotel: boolean
    flightDetails: string
    numberOfAttendees: number
    attendeeNames: string | null
    contactEmail: string | null
    createdAt: Date
    updatedAt: Date
}