import * as React from "react"
import { Activity, ClipboardList, HeartPulse, UsersRound } from "lucide-react"
import { NavLink, useLocation } from "react-router"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar"
import { cn } from "cn"

const links = [
  { title: "Patients", url: "/medecin/patients", icon: <UsersRound /> },
  { title: "Traitements", url: "/medecin/traitements", icon: <ClipboardList /> },
]

export function DoctorSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  return <Sidebar collapsible="offcanvas" {...props}>
    <SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton className="p-1.5! hover:bg-sidebar-accent" render={<NavLink to="/medecin" />}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-teal-800 text-white shadow-2xs dark:bg-teal-600"><HeartPulse className="size-4" /></span>
      <span className="grid flex-1 text-left text-sm leading-tight"><span className="font-bold tracking-tight">MedTrack</span><span className="text-[10px] font-semibold uppercase text-muted-foreground">Espace médecin</span></span>
    </SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
    <SidebarContent><SidebarGroup><SidebarGroupLabel>Suivi médical</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>
      {links.map((item) => {
        const active = location.pathname === item.url || location.pathname.startsWith(`${item.url}/`)
        return <SidebarMenuItem key={item.url}><SidebarMenuButton tooltip={item.title} isActive={active} className={cn("rounded-lg transition-all duration-150", active ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-2xs" : "text-sidebar-foreground/80 hover:text-sidebar-foreground")} render={<NavLink to={item.url} />}>
          <span className={active ? "text-primary" : "text-muted-foreground"}>{item.icon}</span><span>{item.title}</span>{active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
        </SidebarMenuButton></SidebarMenuItem>
      })}
    </SidebarMenu></SidebarGroupContent></SidebarGroup>
    <div className="mt-auto px-4 pb-2 text-xs text-muted-foreground"><div className="flex items-center gap-2 rounded-lg border bg-card/70 p-3"><Activity className="size-4 text-teal-700" /><span>Portail professionnel de santé</span></div></div>
    </SidebarContent><SidebarFooter><NavUser profileUrl="/medecin" profileLabel="Mon espace" /></SidebarFooter>
  </Sidebar>
}
