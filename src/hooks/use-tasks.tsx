import { createContext, useContext, useCallback, useState, ReactNode } from 'react'
import { Task } from "@prisma/client"

interface TasksContextType {
    tasks: Task[]
    isLoading: boolean
    error: string | null
    fetchTasks: () => Promise<void>
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>
    deleteTask: (id: string) => Promise<void>
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTasks = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/tasks')
            if (!response.ok) throw new Error('Failed to fetch tasks')
            const data = await response.json()
            setTasks(data)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch tasks')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const addTask = useCallback(async (
        newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
        setError(null)
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            })
            if (!response.ok) throw new Error('Failed to add task')
            const task = await response.json()
            setTasks(current => [task, ...current])
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add task')
            throw error
        }
    }, [])

    const updateTask = useCallback(async (
        id: string,
        updates: Partial<Task>
    ) => {
        setError(null)
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (!response.ok) throw new Error('Failed to update task')
            const updatedTask = await response.json()
            setTasks(current =>
                current.map(task =>
                    task.id === id ? updatedTask : task
                )
            )
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update task')
            throw error
        }
    }, [])

    const deleteTask = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to delete task')
            setTasks(current => current.filter(task => task.id !== id))
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete task')
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    const value = {
        tasks,
        isLoading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask
    }

    return (
        <TasksContext.Provider value={value} >
            {children}
        </TasksContext.Provider>
    )
}

export function useTasks() {
    const context = useContext(TasksContext)
    if (context === undefined) {
        throw new Error('useTasks must be used within a TasksProvider')
    }
    return context
}