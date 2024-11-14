import {
    ColumnDef,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditableTitle } from "./editable-title"
import styles from './SectionTable.module.css';
import { Task } from "@prisma/client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SectionTableProps {
    section: string
    tasks: Task[]
    columns: ColumnDef<Task>[]
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>
}

export default function SectionTable({ section, tasks, columns, addTask, updateTask }: SectionTableProps) {
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
                order: tasks.length,
                assignedToId: null,
            })
        } catch (error) {
            console.error('Failed to add task:', error)
        }
    }

    const handleSectionUpdate = async (newTitle: string) => {
        try {
            await Promise.all(
                tasks.map(task =>
                    updateTask(task.id, { section: newTitle })
                )
            );
        } catch (error) {
            console.error('Failed to update section name:', error);
            throw error;
        }
    };

    return (
        <div className="rounded-md border p-4">
            <SectionTitleAndButtons
                table={table}
                section={section}
                handleSectionUpdate={handleSectionUpdate}
                handleAddTask={handleAddTask}
            />
            <TableDisplayed table={table} columns={columns} />
        </div>
    )
}

function SectionTitleAndButtons({ section, table, handleSectionUpdate, handleAddTask }: {
    section: string,
    table: ReturnType<typeof useReactTable<Task>>,
    handleSectionUpdate: (newTitle: string) => Promise<void>,
    handleAddTask: () => Promise<void>
}) {
    return (
        <div className="flex items-center justify-between mb-4" >
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
        </div >
    )
}

function TableDisplayed({ table, columns }: {
    table: ReturnType<typeof useReactTable<Task>>, columns: ColumnDef<any, any>[]
}) {
    return (
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
    )
}

function getColumnType(index: number, columnId: string): string {
    if (index === 0) return 'checkbox';

    switch (columnId) {
        case 'completed':
            return 'completed';
        case 'task':
            return 'task';
        case 'details':
            return 'details';
        case 'actions':
            return 'actions';
        case 'assignedTo':
            return 'assignedTo';
        default:
            console.log('Unknown column type:', columnId);
            return '';
    }
}