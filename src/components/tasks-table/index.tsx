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
import { EditableTitle } from "./editable-title"
import styles from './SectionTable.module.css';

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

    const [globalFilter, setGlobalFilter] = React.useState("")

    const columns = React.useMemo(
        () => createColumns({ updateTask, deleteTask }),
        [updateTask, deleteTask]
    )

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    // Group tasks by section, applying global filter first
    const tasksBySection = React.useMemo(() => {
        // Only apply filter if there is a filter term
        const filteredTasks = globalFilter
            ? tasks.filter(task =>
                task.task.toLowerCase().includes(globalFilter.toLowerCase()) ||
                task.details?.toLowerCase().includes(globalFilter.toLowerCase())
            )
            : tasks;  // If no filter, use all tasks

        // Get unique sections from ALL tasks, not just filtered ones
        const sections = [...tasks.map(task => task.section)];

        const reduced = sections.reduce((acc, section) => {
            // For each section, get the tasks that belong to it from the filtered set
            const sectionTasks = filteredTasks.filter(task => task.section === section);

            // Only include sections that have tasks (when filtering) or include all sections when not filtering
            if (sectionTasks.length > 0 || !globalFilter) {
                acc[section] = sectionTasks;
            }
            return acc;
        }, {} as Record<string, Task[]>);

        // log whether there is a task with the task name "find photographer"
        console.log("**** 1", reduced)

        return reduced;
    }, [tasks, globalFilter]);

    const handleAddSection = () => {
        const sectionName = prompt("Enter new section name:")
        if (sectionName) {
            // Check if section already exists
            const sectionExists = Object.keys(tasksBySection).includes(sectionName)
            if (sectionExists) {
                alert("This section already exists. Please choose a different name.")
                return
            }

            addTask({
                task: "New Task",
                details: "",
                completed: false,
                section: sectionName,
                order: 0
            })
        }
    }

    const stats = React.useMemo(() => {
        const total = tasks.length
        const completed = tasks.filter(t => t.completed).length
        return { total, completed }
    }, [tasks])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    <Input
                        placeholder="Filter all tasks..."
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    {globalFilter && (
                        <div className="text-sm text-muted-foreground">
                            Found {Object.values(tasksBySection).reduce((acc, tasks) => acc + tasks.length, 0)} tasks
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                        {stats.completed} of {stats.total} tasks completed ({Math.round((stats.completed / stats.total) * 100 || 0)}%)
                    </div>
                    <Button onClick={handleAddSection}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Section
                    </Button>
                </div>
            </div>
            {Object.entries(tasksBySection)
                .sort(([a], [b]) => a.localeCompare(b)) // Sort sections alphabetically
                .map(([section, sectionTasks]) => (
                    <SectionTable
                        key={section}
                        section={section}
                        tasks={sectionTasks}
                        columns={columns}
                        addTask={addTask}
                        updateTask={updateTask}
                    />
                ))}
            {Object.keys(tasksBySection).length === 0 && !globalFilter && (
                <div className="text-center py-8 text-muted-foreground">
                    No sections yet. Click "Add New Section" to get started.
                </div>
            )}
        </div>
    )
}


interface SectionTableProps {
    section: string
    tasks: Task[]
    columns: ColumnDef<Task>[]
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>
}

function SectionTable({ section, tasks, columns, addTask, updateTask }: SectionTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

    const sortedTasks = React.useMemo(() => {
        return [...tasks].sort((a, b) => a.order - b.order)
    }, [tasks])

    const table = useReactTable({
        data: sortedTasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
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

    const handleSectionUpdate = async (newTitle: string) => {
        // Update all tasks in this section
        try {
            await Promise.all(
                tasks.map(task =>
                    updateTask(task.id, { section: newTitle })
                )
            );
        } catch (error) {
            console.error('Failed to update section name:', error);
            throw error; // Let the EditableTitle component handle the error
        }
    };

    return (
        <div className="rounded-md border p-4 text-black">
            <div className="flex items-center justify-between mb-4">
                <EditableTitle
                    value={section}
                    onUpdate={handleSectionUpdate}
                />
                <div className="flex items-center space-x-2">
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
            <div className={styles.tableContainer}>
                <Table className={styles.table}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => (
                                    <TableHead
                                        key={header.id}
                                        className={styles.cell}
                                        data-column={getColumnType(index, header.id)}
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
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell
                                            key={cell.id}
                                            className={styles.cell}
                                            data-column={getColumnType(index, cell.column.id)}
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

function getColumnType(index: number, columnId: string): string {
    if (index === 0) return 'checkbox';
    if (columnId === 'actions') return 'actions';
    if (columnId === 'task') return 'task';
    if (columnId === 'details') return 'details';
    return '';
}