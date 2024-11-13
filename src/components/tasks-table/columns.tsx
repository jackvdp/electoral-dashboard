import { ColumnDef } from "@tanstack/react-table"
import { Task } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, MoveUp, MoveDown, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { EditableCell } from "../reusables/editable-cell"
import { User, UserAvatar, UserSelect } from "./UserAvatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CreateColumnsProps {
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>
    deleteTask: (id: string) => Promise<void>
    users: User[]
}

export const createColumns = ({
    updateTask,
    deleteTask,
    users
}: CreateColumnsProps): ColumnDef<Task>[] => {
    return [
        {
            accessorKey: "completed",
            header: "Completed",
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={row.getValue("completed") as boolean}
                        onCheckedChange={(checked) => {
                            updateTask(row.original.id, { completed: !!checked })
                        }}
                        aria-label="Select task"
                    />
                </div>
            ),
        },
        {
            accessorKey: "task",
            header: "Task",
            cell: ({ row }) => (
                <div className={row.original.completed ? "opacity-50" : ""}>
                    <EditableCell
                        value={(row.getValue("task") as string) || ""}
                        onUpdate={(value: string) => updateTask(row.original.id, { task: value })}
                    />
                </div>
            ),
        },
        {
            accessorKey: "details",
            header: "Further Details",
            cell: ({ row }) => (
                <div className={row.original.completed ? "opacity-50" : ""}>
                    <EditableCell
                        value={(row.getValue("details") as string) || ""}
                        onUpdate={(value: string) => updateTask(row.original.id, { details: value })}
                    />
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row, table }) => {
                const task = row.original
                const allTasks = (table.options.data as Task[])
                const currentIndex = allTasks.findIndex(t => t.id === task.id)
                const isFirst = currentIndex === 0
                const isLast = currentIndex === allTasks.length - 1

                const handleMove = async (direction: 'up' | 'down') => {
                    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
                    if (newIndex < 0 || newIndex >= allTasks.length) return

                    const targetTask = allTasks[newIndex]
                    const currentOrder = task.order
                    const targetOrder = targetTask.order

                    // Swap orders
                    await updateTask(task.id, { order: targetOrder })
                    await updateTask(targetTask.id, { order: currentOrder })
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => handleMove('up')}
                                disabled={isFirst}
                            >
                                <MoveUp className="mr-2 h-4 w-4" /> Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleMove('down')}
                                disabled={isLast}
                            >
                                <MoveDown className="mr-2 h-4 w-4" /> Move Down
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => deleteTask(task.id)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
        {
            id: "assignedTo",
            header: "Assigned To",
            cell: ({ row }) => {
              const task = row.original
              const assignedUser = users.find(u => u.name === task.assignedToId) ?? null
          
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`h-8 w-8 p-0 ${task.completed ? "opacity-50" : ""}`}>
                      <UserAvatar user={assignedUser} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <UserSelect
                      users={users}
                      selectedUser={assignedUser}
                      onSelect={(user) => {
                        updateTask(task.id, { assignedToId: user?.name || null })
                      }}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
          }
    ]
}