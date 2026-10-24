import { Outlet } from "react-router"
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DoctorLayout() {
  return <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
    <DoctorSidebar variant="inset" /><SidebarInset><SiteHeader /><div className="flex flex-1 flex-col"><div className="@container/main flex flex-1 flex-col gap-2"><Outlet /></div></div></SidebarInset>
  </SidebarProvider>
}
