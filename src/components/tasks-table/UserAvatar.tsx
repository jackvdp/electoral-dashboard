import { useMemo } from 'react'

export interface User {
    name: string
    color?: string
}

export const COLORS = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
]

export function getInitials(name: string): string {
    const parts = name.split(' ')
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
}

export function UserAvatar({ user, size = 'md', onClick }: {
    user: User | null,
    size?: 'sm' | 'md' | 'lg',
    onClick?: () => void
}) {
    const sizeClasses = {
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base'
    };

    const initials = user ? getInitials(user.name) : '';
    const backgroundColor = user?.color || COLORS[0];

    return user ? (
        <div
            className={`${sizeClasses[size]} ${backgroundColor} rounded-full flex items-center justify-center text-white font-medium cursor-pointer`}
            onClick={onClick}
        >
            {initials}
        </div>
    ) : (
        <div
            className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer`}
            onClick={onClick}
        >
            <span className="sr-only">Assign user</span>
            +
        </div>
    );
}

export function UserAvatarGroup({ users, max = 3 }: { users: User[], max?: number }) {
    const visibleUsers = users.slice(0, max)
    const remaining = users.length - max

    return (
        <div className="flex -space-x-2">
            {visibleUsers.map((user, index) => (
                <UserAvatar key={index} user={user} size="sm" />
            ))}
            {remaining > 0 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                    +{remaining}
                </div>
            )}
        </div>
    )
}

// User selection dialog component
export function UserSelect({
    users,
    selectedUser,
    onSelect
}: {
    users: User[]
    selectedUser: User | null
    onSelect: (user: User | null) => void
}) {
    return (
        <div className="p-2 space-y-2">
            <div className="font-medium text-sm mb-2">Assign to:</div>
            <div className="space-y-1">
                {users.map(user => (
                    <div
                        key={user.name}
                        className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                            selectedUser?.name === user.name ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                        onClick={() => onSelect(user)}
                    >
                        <UserAvatar user={user} size="sm" />
                        <span className="text-sm">{user.name}</span>
                    </div>
                ))}
                <div
                    className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => onSelect(null)}
                >
                    <UserAvatar user={null} size="sm" />
                    <span className="text-sm">Unassign</span>
                </div>
            </div>
        </div>
    );
}
