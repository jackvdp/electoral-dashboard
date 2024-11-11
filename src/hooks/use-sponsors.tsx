import { createContext, useContext, useCallback, useState, ReactNode } from 'react'
import type { Sponsor } from '@/types'

interface SponsorsContextType {
    sponsors: Sponsor[]
    isLoading: boolean
    error: string | null
    fetchSponsors: () => Promise<void>
    addSponsor: (sponsor: Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    updateSponsor: (id: string, updates: Partial<Sponsor>) => Promise<void>
    deleteSponsor: (id: string) => Promise<void>
}

const SponsorsContext = createContext<SponsorsContextType | undefined>(undefined)

export function SponsorsProvider({ children }: { children: ReactNode }) {
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSponsors = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/sponsors')
            if (!response.ok) throw new Error('Failed to fetch sponsors')
            const data = await response.json()
            setSponsors(data)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch sponsors')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const addSponsor = useCallback(async (
        newSponsor: Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/sponsors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSponsor)
            })
            if (!response.ok) throw new Error('Failed to add sponsor')
            const sponsor = await response.json()
            setSponsors(current => [sponsor, ...current])
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add sponsor')
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    const updateSponsor = useCallback(async (
        id: string,
        updates: Partial<Sponsor>
    ) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/sponsors/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (!response.ok) throw new Error('Failed to update sponsor')
            const updatedSponsor = await response.json()
            setSponsors(current =>
                current.map(sponsor =>
                    sponsor.id === id ? updatedSponsor : sponsor
                )
            )
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update sponsor')
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    const deleteSponsor = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/sponsors/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to delete sponsor')
            setSponsors(current => current.filter(sponsor => sponsor.id !== id))
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete sponsor')
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    const value = {
        sponsors,
        isLoading,
        error,
        fetchSponsors,
        addSponsor,
        updateSponsor,
        deleteSponsor
    }

    return (
        <SponsorsContext.Provider value={value}>
            {children}
        </SponsorsContext.Provider>
    )
}

// Custom hook to use the context
export function useSponsors() {
    const context = useContext(SponsorsContext)
    if (context === undefined) {
        throw new Error('useSponsors must be used within a SponsorsProvider')
    }
    return context
}