import { useState } from 'react'
import { User } from '../components/tasks-table/UserAvatar'
import { Task } from '@prisma/client';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);

    const addUser = (name: string) => {
        if (!users.some(user => user.name === name)) {
            const newUser: User = {
                name
            };
            setUsers(prev => [...prev, newUser]);
        }
    };

    const removeUser = (name: string) => {
        setUsers(prev => prev.filter(user => user.name !== name));
    };

    const syncUsersFromTasks = (tasks: Task[]) => {
        const uniqueUsers = Array.from(new Set(
            tasks
                .filter(task => task.assignedToId)
                .map(task => task.assignedToId as string)
        )).map(name => ({
            name
        }));
        setUsers(uniqueUsers);
    };

    return {
        users,
        addUser,
        removeUser,
        syncUsersFromTasks
    };
}

function indexOfUser(users: User[], name: string): number {
    return users.findIndex(user => user.name === name);
}