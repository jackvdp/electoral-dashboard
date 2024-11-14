import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "./ui/sidebar"
import { ModeToggle } from "./reusables/mode-toggle"

interface NavigationBarProps {
  children: ReactNode
  className?: string
}

export default function NavigationBar({ children, className }: NavigationBarProps) {
  return (
    <>
      <div className={cn(
        "sticky top-0 z-50",
        "border-b",
        "bg-background/80 backdrop-blur-lg",
        "supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="flex items-center h-20 px-4">
          <SidebarTrigger className="shrink-0 mr-4" />

          <div className="flex-1">
            {children}
          </div>

          <div className="pl-4">
            <ModeToggle />
          </div>
        </div>
      </div>
      <div className="h-4" />
    </>
  )
}
