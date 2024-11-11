'use client';
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TasksView } from "@/components/tasks-view"
import { SponsorsTable } from "@/components/sponsors-table"
import { useState } from "react"
import { SponsorsProvider } from "@/hooks/use-sponsors"

type View = 'sponsors' | 'tasks';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('sponsors');

  return (
    <SponsorsProvider>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-white">
          <DashboardSidebar
            currentView={currentView}
            onViewChange={setCurrentView}
          />
          <main className="flex-1 p-6">
            {currentView === 'sponsors' &&
              <SponsorsTable />
            }
            {currentView === 'tasks' &&
              <TasksView />
            }
          </main>
        </div>
      </SidebarProvider>
    </SponsorsProvider>
  );
}