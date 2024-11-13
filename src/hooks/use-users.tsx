import { useState } from 'react'
import { User } from '../components/tasks-table/UserAvatar'
import { COLORS } from '../components/tasks-table/UserAvatar'

export function useUsers() {
    const [users, setUsers] = useState<User[]>([])

    const addUser = (name: string) => {
        const newUser: User = {
            id: crypto.randomUUID(),
            name,
            color: COLORS[users.length % COLORS.length]
        }
        setUsers(prev => [...prev, newUser])
    }

    const removeUser = (id: string) => {
        setUsers(prev => prev.filter(user => user.id !== id))
    }

    return {
        users,
        addUser,
        removeUser
    }
}