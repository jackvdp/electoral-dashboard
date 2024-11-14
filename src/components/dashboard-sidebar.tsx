import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter
} from "@/components/ui/sidebar"
import { ClipboardList, Users } from "lucide-react"
import { ModeToggle } from "./reusables/mode-toggle";

type View = 'sponsors' | 'tasks'

interface DashboardSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function DashboardSidebar({ currentView, onViewChange }: DashboardSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="px-6 py-4 text-lg font-semibold">Electoral Dashboard</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange('tasks')}
                  className={currentView === 'tasks' ? 'bg-accent' : ''}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>Tasks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange('sponsors')}
                  className={currentView === 'sponsors' ? 'bg-accent' : ''}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Sponsors</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 pb-4">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}