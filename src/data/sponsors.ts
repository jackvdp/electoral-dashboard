import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Sponsor } from '../types'

interface SponsorsStore {
    sponsors: Sponsor[]
    addSponsor: (sponsor: Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateSponsor: (id: string, updates: Partial<Sponsor>) => void
    deleteSponsor: (id: string) => void
}

export const useSponsors = create<SponsorsStore>()(
    persist(
        (set) => ({
            sponsors: [],
            addSponsor: (newSponsor) =>
                set((state) => ({
                    sponsors: [
                        ...state.sponsors,
                        {
                            ...newSponsor,
                            id: crypto.randomUUID(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    ],
                })),
            updateSponsor: (id, updates) =>
                set((state) => ({
                    sponsors: state.sponsors.map((sponsor) =>
                        sponsor.id === id
                            ? { ...sponsor, ...updates, updatedAt: new Date() }
                            : sponsor
                    ),
                })),
            deleteSponsor: (id) =>
                set((state) => ({
                    sponsors: state.sponsors.filter((sponsor) => sponsor.id !== id),
                })),
        }),
        {
            name: 'sponsors-storage',
        }
    )
)