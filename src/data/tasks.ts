// data/tasks.ts
export const tasks = [
    {
        id: 1,
        category: "Immediate Actions",
        completed: true,
        dueDate: "2024-02-10",
        task: "Sign off joint invitation letter to attendees/and asking for nominations",
        details: null
    },
    {
        id: 2,
        category: "Immediate Actions",
        completed: true,
        dueDate: "2024-02-13",
        task: "Send out letter for nominations and attendees",
        details: null
    },
    {
        id: 3,
        category: "PRE- EVENT LOGISTICS/COMMISSION SUPPORT",
        completed: true,
        dueDate: "2024-07-14",
        task: "Agree visa process with commission",
        details: null
    },
    {
        id: 4,
        category: "PRE- EVENT LOGISTICS/COMMISSION SUPPORT",
        completed: true,
        dueDate: "2024-07-14",
        task: "Establish airport transfer details with Devianee and commission",
        details: "Confirm process – i.e. send over list of delegates with flight times to ECM, confirm who will be meeting delegates, how they will sort into cars, arrange payment"
    },
    // ... add remaining tasks
]

export type Task = typeof tasks[number];