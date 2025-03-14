"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useEffect } from "react"
import { createColumns } from "./columns"
import { DominicanTask as Task } from "@prisma/client"
import SectionTable from "./SectionTable"
import { useMemo, useState } from "react"
import { useUsers } from "@/hooks/use-users"
import { UserFilterDropdown } from "./UserFilterButton"
import NavigationBar from "../navigation-bar"

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

    const { users, addUser, syncUsersFromTasks } = useUsers()
    const [globalFilter, setGlobalFilter] = useState("")
    const [userFilter, setUserFilter] = useState<string | null>(null)

    const columns = useMemo(
        () => createColumns({ updateTask, deleteTask, users }),
        [updateTask, deleteTask, users]
    )

    const handleAddUser = () => {
        const name = prompt("Enter user name:")
        if (name) {
            addUser(name)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    useEffect(() => {
        syncUsersFromTasks(tasks);
    }, [tasks]);

    const tasksBySection = useMemo(() => {
        const filteredTasks = tasks.filter(task => {
            const matchesText = !globalFilter || (
                task.task.toLowerCase().includes(globalFilter.toLowerCase()) ||
                task.details?.toLowerCase().includes(globalFilter.toLowerCase())
            );

            const matchesUser = !userFilter || task.assignedToId === userFilter;

            return matchesText && matchesUser;
        });

        const sections = [...new Set(tasks.map(task => task.section))];

        const reduced = sections.reduce((acc, section) => {
            const sectionTasks = filteredTasks.filter(task => task.section === section);
            if (sectionTasks.length > 0 || (!globalFilter && !userFilter)) {
                acc[section] = sectionTasks;
            }
            return acc;
        }, {} as Record<string, Task[]>);

        return reduced;
    }, [tasks, globalFilter, userFilter]);

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
                order: 0,
                assignedToId: null
            })
        }
    }

    const stats = useMemo(() => {
        const filteredTasks: Task[] = Object.values(tasksBySection).flat() as Task[];
        const total = filteredTasks.length;
        const completed = filteredTasks.filter(t => t.completed).length;
        return { total, completed };
    }, [tasksBySection]);

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="space-y-8">
            <NavigationBar>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Input
                            placeholder="Filter all tasks..."
                            value={globalFilter}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="max-w-sm"
                        />
                        <UserFilterDropdown
                            users={users}
                            selectedUser={userFilter}
                            onUserSelect={setUserFilter}
                        />
                        <Button onClick={handleAddUser} variant="ghost">
                            Add User
                        </Button>
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
            </NavigationBar>
            {Object.entries(tasksBySection)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([section, sectionTasks]) => (
                    <SectionTable
                        key={section}
                        section={section}
                        tasks={sectionTasks as Task[]}
                        columns={columns}
                        addTask={addTask}
                        updateTask={updateTask}
                    />
                ))}
            {Object.keys(tasksBySection).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    {globalFilter || userFilter ?
                        "No tasks match your filters." :
                        "No sections yet. Click \"Add New Section\" to get started."
                    }
                </div>
            )}
        </div>
    )
}