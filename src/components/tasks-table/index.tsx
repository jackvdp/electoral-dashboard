"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useEffect } from "react"
import { createColumns } from "./columns"
import { Task } from "@prisma/client"

const DEFAULT_SECTIONS = [
    "Immediate Actions",
    "PRE- EVENT LOGISTICS/COMMISSION SUPPORT",
    "NOMINATIONS",
    "AWARDS PANEL",
    "CONFERENCE",
    "AWARDS",
    "BROCHURE & WEBSITE",
    "Staffing",
    "Post Event"
]

export function TasksTable() {
    const {
        tasks,
        isLoading,
        error,
        addTask,
        updateTask,
        deleteTask,
        fetchTasks
    } = useTasks()

    const columns = React.useMemo(
        () => createColumns({ updateTask, deleteTask }),
        [updateTask, deleteTask]
    )

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    // Group tasks by section
    const tasksBySection = React.useMemo(() => {
        const sections = tasks.length === 0 ? DEFAULT_SECTIONS : [...new Set(tasks.map(task => task.section))]
        return sections.reduce((acc, section) => {
            acc[section] = tasks.filter(task => task.section === section)
            return acc
        }, {} as Record<string, Task[]>)
    }, [tasks])

    const handleAddSection = () => {
        const sectionName = prompt("Enter new section name:")
        if (sectionName) {
            addTask({
                task: "New Task",
                details: "",
                completed: false,
                section: sectionName,
                order: 0
            })
        }
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button onClick={handleAddSection}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Section
                </Button>
            </div>
            {Object.entries(tasksBySection).map(([section, sectionTasks]) => (
                <SectionTable
                    key={section}
                    section={section}
                    tasks={sectionTasks}
                    columns={columns}
                    addTask={addTask}
                />
            ))}
        </div>
    )
}

interface SectionTableProps {
    section: string
    tasks: Task[]
    columns: ColumnDef<Task>[]
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

function SectionTable({ section, tasks, columns, addTask }: SectionTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

    const sortedTasks = React.useMemo(() => {
        return [...tasks].sort((a, b) => a.order - b.order)
    }, [tasks])

    const table = useReactTable({
        data: sortedTasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    })

    const handleAddTask = async () => {
        try {
            await addTask({
                task: "New Task",
                details: "",
                completed: false,
                section,
                order: tasks.length
            })
        } catch (error) {
            console.error('Failed to add task:', error)
        }
    }

    return (
        <div className="rounded-md border p-4 text-black">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{section}</h2>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Filter tasks..."
                        value={(table.getColumn("task")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("task")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                    <Button
                        onClick={handleAddTask}
                        size="sm"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{
                                            width: header.getSize(),
                                            minWidth: header.column.columnDef.minSize,
                                            maxWidth: header.column.columnDef.maxSize,
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{
                                                width: cell.column.getSize(),
                                                minWidth: cell.column.columnDef.minSize,
                                                maxWidth: cell.column.columnDef.maxSize,
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No tasks in this section.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}