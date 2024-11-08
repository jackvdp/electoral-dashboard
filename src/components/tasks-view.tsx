'use client';

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EditableCell } from "@/components/editable-cell"
import { Mail } from "lucide-react"
import { tasks as initialTasks, type Task } from "@/data/tasks"

export function TasksView() {
    const [tasks, setTasks] = useState<typeof initialTasks>(initialTasks)

    const updateTask = (id: number, updates: Partial<Task>) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
        ))
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <div className="space-x-2">
                    <Badge variant="secondary">
                        {tasks.filter(t => t.completed).length}/{tasks.length} completed
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => {
                        const csv = [
                            ["Category", "Task", "Due Date", "Details", "Completed"],
                            ...tasks.map(t => [
                                t.category,
                                t.task,
                                t.dueDate || "",
                                t.details || "",
                                t.completed ? "Yes" : "No"
                            ])
                        ].map(row => row.join(",")).join("\n");

                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'tasks.csv';
                        a.click();
                    }}>
                        <Mail className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Done</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Task</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={task.completed}
                                            onCheckedChange={(checked) =>
                                                updateTask(task.id, { completed: !!checked })
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <EditableCell
                                            value={task.category}
                                            onChange={(value) => updateTask(task.id, { category: value })}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <EditableCell
                                            value={task.task}
                                            onChange={(value) => updateTask(task.id, { task: value })}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <EditableCell
                                            value={task.dueDate || ''}
                                            onChange={(value) => updateTask(task.id, { dueDate: value })}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <EditableCell
                                            value={task.details || ''}
                                            onChange={(value) => updateTask(task.id, { details: value })}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}