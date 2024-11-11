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
import { Plus } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useEffect } from "react"
import { createColumns } from "./columns"
import { Task } from "@prisma/client"

export function TasksTable() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

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
        return tasks.reduce((acc, task) => {
            if (!acc[task.section]) {
                acc[task.section] = []
            }
            acc[task.section].push(task)
            return acc
        }, {} as Record<string, Task[]>)
    }, [tasks])

    const handleAddTask = async (section: string) => {
        try {
            await addTask({
                task: "New Task",
                details: "",
                completed: false,
                section,
                order: tasks.filter(t => t.section === section).length
            })
        } catch (error) {
            console.error('Failed to add task:', error)
        }
    }

    if (tasks.length === 0) return <div className="text-black">No tasks found.</div>

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="space-y-8">
            {Object.entries(tasksBySection).map(([section, sectionTasks]) => (
                <div key={section} className="rounded-md border p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">{section}</h2>
                        <Button
                            onClick={() => handleAddTask(section)}
                            size="sm"
                            className="ml-4"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Task
                        </Button>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead key={column.id}>
                                            {column.id === "select"
                                                ? null
                                                : flexRender(
                                                    column.header,
                                                    { column }
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sectionTasks.length > 0 ? (
                                    sectionTasks.map((task) => (
                                        <TableRow key={task.id}>
                                            {columns.map((column) => (
                                                <TableCell key={column.id}>
                                                    {flexRender(
                                                        column.cell,
                                                        { row: { original: task, getValue: (key: string) => task[key as keyof Task] } }
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
            ))}
        </div>
    )
}