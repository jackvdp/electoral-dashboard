export type SponsorStatus = 'pending' | 'confirmed' | 'declined'

export interface Sponsor {
    id: string
    name: string
    initialContact: boolean
    initialPhoneCall: boolean
    dedicatedSpeakingSlot: string | null
    exhibitionSpace: string
    receivedProgrammeAdvert: boolean
    customsSupport: boolean
    bookedHotel: boolean
    numberOfAttendees: number
    attendeeNames: string
    contactEmail: string
    status: SponsorStatus
    createdAt: Date
    updatedAt: Date
}