'use client';

import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TasksView } from "@/components/tasks-view"
import { SponsorsView } from "@/components/sponsors-view"
import { useState } from "react"

type View = 'sponsors' | 'tasks' | 'settings';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('sponsors');

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-white">
        <DashboardSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6">
          {currentView === 'sponsors' && <SponsorsView />}
          {currentView === 'tasks' && <TasksView />}
          {currentView === 'settings' && <div>Settings</div>}
        </main>
      </div>
    </SidebarProvider>
  )
}