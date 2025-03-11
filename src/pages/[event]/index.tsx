import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SponsorsTable } from "@/components/sponsors-table"
import { TasksTable } from "@/components/tasks-table";
import { useState } from "react"
import { SponsorsProvider } from "@/hooks/use-sponsors"
import { TasksProvider } from "@/hooks/use-tasks";
import { ThemeProvider } from "@/components/theme-provider";
import {useRouter} from "next/router";
import Error from "next/error";
import {getEventDetails} from "@/lib/getEventDetails";
import Head from "next/head";

type View = 'sponsors' | 'tasks';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('tasks');
  const router = useRouter();
  const { event } = router.query;

  if (typeof event !== 'string') {
    return <Error statusCode={404} title="Event not found" />;
  }

  const {name, date} = getEventDetails(event);

  return (
      <>
        <Head>
          <title>{name + " Dashboard | " + date}</title>
        </Head>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <TasksProvider event={event}>
            <SponsorsProvider event={event}>
              <SidebarProvider defaultOpen>
                <div className="flex min-h-screen w-full">
                  <DashboardSidebar
                      currentView={currentView}
                      event={event}
                      onViewChange={setCurrentView}
                  />
                  <main className="flex-1 px-6 pb-6">
                    {currentView === 'sponsors' &&
                        <SponsorsTable/>
                    }
                    {currentView === 'tasks' &&
                        <TasksTable/>
                    }
                  </main>
                </div>
              </SidebarProvider>
            </SponsorsProvider>
          </TasksProvider>
        </ThemeProvider>
      </>
  );
}