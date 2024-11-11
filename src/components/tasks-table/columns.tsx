import { ColumnDef } from "@tanstack/react-table"
import { Task } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { EditableCell } from "../reusables/editable-cell"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CreateColumnsProps {
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>
    deleteTask: (id: string) => Promise<void>
}

export const createColumns = ({
    updateTask,
    deleteTask,
}: CreateColumnsProps): ColumnDef<Task>[] => {
    return [
        {
            accessorKey: "completed",
            header: "Completed",
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getValue("completed") as boolean}
                    onCheckedChange={(checked) => {
                        updateTask(row.original.id, { completed: !!checked })
                    }}
                    aria-label="Select task"
                />
            ),
        },
        {
            accessorKey: "task",
            header: "Task",
            cell: ({ row }) => (
                <EditableCell
                    value={(row.getValue("task") as string) || ""}
                    onUpdate={(value: string) => updateTask(row.original.id, { task: value })}
                />
            ),
        },
        {
            accessorKey: "details",
            header: "Further Details",
            cell: ({ row }) => (
                <EditableCell
                    value={(row.getValue("details") as string) || ""}
                    onUpdate={(value: string) => updateTask(row.original.id, { details: value })}
                />
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const task = row.original
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
                            <DropdownMenuItem onClick={() => deleteTask(task.id)}>
                                Delete task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}