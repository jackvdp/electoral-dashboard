'use client';
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SponsorsTable } from "@/components/sponsors-table"
import { TasksTable } from "@/components/tasks-table";
import { useState } from "react"
import { SponsorsProvider } from "@/hooks/use-sponsors"
import { TasksProvider } from "@/hooks/use-tasks";
import { ThemeProvider } from "@/components/theme-provider";

type View = 'sponsors' | 'tasks';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('tasks');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TasksProvider>
        <SponsorsProvider>
          <SidebarProvider defaultOpen>
            <div className="flex min-h-screen w-full">
              <DashboardSidebar
                currentView={currentView}
                onViewChange={setCurrentView}
              />
              <main className="flex-1 px-6 pb-6">
                {currentView === 'sponsors' &&
                  <SponsorsTable />
                }
                {currentView === 'tasks' &&
                  <TasksTable />
                }
              </main>
            </div>
          </SidebarProvider>
        </SponsorsProvider>
      </TasksProvider>
    </ThemeProvider>
  );
}