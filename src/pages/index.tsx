'use client';

import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TasksView } from "@/components/tasks-view"
import { DataTable } from "@/components/sponsors-table/data-table";
import { useState } from "react"
import { useSponsors } from "@/data/sponsors"
// import { columns } from "@/components/sponsors-table/columns"

type View = 'sponsors' | 'tasks';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('sponsors');
  const { sponsors } = useSponsors()

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-white">
        <DashboardSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6">
          {/* {currentView === 'sponsors' && <DataTable columns={columns} data={sponsors} />} */}
          {currentView === 'tasks' && <TasksView />}
        </main>
      </div>
    </SidebarProvider>
  )
}