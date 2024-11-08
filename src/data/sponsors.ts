// data/sponsors.ts
export const sponsors = [
    {
        id: 1,
        name: "Smartmatic",
        initialContact: true,
        initialPhoneCall: true,
        preEventActivities: false,
        dedicatedSpeakingSlot: "Wafula",
        exhibitionSpace: "Yes – need a TV",
        receivedProgrammeAdvert: true,
        customsSupport: false,
        bookedHotel: true,
        numberOfAttendees: 4,
        attendeeNames: "Jesús Gil, Alexander Rakov, Khodr Akil, Guillermo Solis",
        contactEmail: "ernesto.parisca@smartmatic.com; ssaba@smartmatic.com"
    },
    {
        id: 2,
        name: "Al Ghurair",
        initialContact: true,
        initialPhoneCall: true,
        preEventActivities: false,
        dedicatedSpeakingSlot: null,
        exhibitionSpace: "Yes",
        receivedProgrammeAdvert: true,
        customsSupport: false,
        bookedHotel: false,
        numberOfAttendees: 2,
        attendeeNames: "Rajeev Kumar tyagi, Abdul Kayum",
        contactEmail: "Rajeev.Tyagi@al-ghurair.com"
    },
    // ... add remaining sponsors
]

export type Sponsor = typeof sponsors[number];