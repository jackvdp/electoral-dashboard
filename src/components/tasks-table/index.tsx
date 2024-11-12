"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useEffect } from "react"
import { createColumns } from "./columns"
import { Task } from "@prisma/client"
import SectionTable from "./SectionTable"
import { useMemo, useState } from "react"

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

    const [globalFilter, setGlobalFilter] = useState("")

    const columns = useMemo(
        () => createColumns({ updateTask, deleteTask }),
        [updateTask, deleteTask]
    )

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const tasksBySection = useMemo(() => {
        const filteredTasks = globalFilter
            ? tasks.filter(task =>
                task.task.toLowerCase().includes(globalFilter.toLowerCase()) ||
                task.details?.toLowerCase().includes(globalFilter.toLowerCase())
            )
            : tasks;

        const sections = [...tasks.map(task => task.section)];

        const reduced = sections.reduce((acc, section) => {
            const sectionTasks = filteredTasks.filter(task => task.section === section);
            if (sectionTasks.length > 0 || !globalFilter) {
                acc[section] = sectionTasks;
            }
            return acc;
        }, {} as Record<string, Task[]>);

        return reduced;
    }, [tasks, globalFilter]);

    const handleAddSection = () => {
        const sectionName = prompt("Enter new section name:")
        if (sectionName) {
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

    const stats = useMemo(() => {
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
                .sort(([a], [b]) => a.localeCompare(b))
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