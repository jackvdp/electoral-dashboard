import { useState, useEffect } from 'react';
import { Sponsor } from '@/types';

export function useSponsors() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSponsors = async () => {
        try {
            const response = await fetch('/api/sponsors');
            if (!response.ok) throw new Error('Failed to fetch sponsors');
            const data = await response.json();
            setSponsors(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const addSponsor = async (newSponsor: Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const response = await fetch('/api/sponsors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSponsor),
            });
            if (!response.ok) throw new Error('Failed to add sponsor');
            const data = await response.json();
            setSponsors(prev => [data, ...prev]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const updateSponsor = async (id: string, updates: Partial<Sponsor>) => {
        try {
            const response = await fetch(`/api/sponsors/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update sponsor');
            const data = await response.json();
            setSponsors(prev => prev.map(sponsor =>
                sponsor.id === id ? { ...sponsor, ...data } : sponsor
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const deleteSponsor = async (id: string) => {
        try {
            const response = await fetch(`/api/sponsors/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete sponsor');
            setSponsors(prev => prev.filter(sponsor => sponsor.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    return {
        sponsors,
        loading,
        error,
        addSponsor,
        updateSponsor,
        deleteSponsor,
    };
}