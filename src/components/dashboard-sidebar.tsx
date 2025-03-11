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
import {getEventDetails} from "@/lib/getEventDetails";

type View = 'sponsors' | 'tasks'

interface DashboardSidebarProps {
  currentView: View;
  event: string
  onViewChange: (view: View) => void;
}

export function DashboardSidebar({ currentView, event, onViewChange }: DashboardSidebarProps) {
  const { name, date } = getEventDetails(event);

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="px-6 pt-4 text-2xl font-bold">{name}</h1>
        <h1 className="px-6 py-4 text-xl">{date}</h1>
        <hr/>
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