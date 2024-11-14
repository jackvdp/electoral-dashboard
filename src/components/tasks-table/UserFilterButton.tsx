import { Button } from "@/components/ui/button"
import { UserAvatar, User, UserAvatarGroup } from "./UserAvatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, Users } from "lucide-react"

interface UserFilterDropdownProps {
    users: User[]
    selectedUser: string | null
    onUserSelect: (userId: string | null) => void
}

export function UserFilterDropdown({ users, selectedUser, onUserSelect }: UserFilterDropdownProps) {
    const selected = users.find(user => user.name === selectedUser)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex justify-start"
                >
                    {selected ? (
                        <>
                            <UserAvatar user={selected} size="sm" />
                            <span className="truncate">{selected.name}</span>
                        </>
                    ) : (
                        <>
                            <Users className="h-4 w-4 mr-2" />
                            <span>All Users</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
                <DropdownMenuLabel>Filter by user</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex items-center justify-between"
                    onClick={() => onUserSelect(null)}
                >
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>All Users</span>
                    </div>
                    {!selectedUser && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                {users.map(user => (
                    <DropdownMenuItem
                        key={user.name}
                        className="flex items-center justify-between"
                        onClick={() => onUserSelect(user.name)}
                    >
                        <div className="flex items-center space-x-2">
                            <UserAvatar user={user} size="sm" />
                            <span>{user.name}</span>
                        </div>
                        {selectedUser === user.name && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}