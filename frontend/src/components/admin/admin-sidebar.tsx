import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  FileChartColumnIcon,
  FileIcon,
  HospitalIcon,
  HeartPulseIcon,
} from "lucide-react"
import { NavStructures } from "./nav-structures"
import { NavLink } from "react-router"

const data = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Cycles de soins",
      url: "#",
      icon: <ListIcon />,
    },
    {
      title: "Statistiques",
      url: "#",
      icon: <ChartBarIcon />,
    },
    {
      title: "Dossiers",
      url: "#",
      icon: <FolderIcon />,
    },
    {
      title: "Équipes médicales",
      url: "#",
      icon: <UsersIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "Assistance",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Recherche globale",
      url: "#",
      icon: <SearchIcon />,
    },
  ],
  structures: [
    {
      name: "Établissements",
      url: "/admin/etablissements",
      icon: <HospitalIcon />,
    },
    {
      name: "Rapports d'activité",
      url: "#",
      icon: <FileChartColumnIcon />,
    },
    {
      name: "Documents administratifs",
      url: "#",
      icon: <FileIcon />,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-sidebar-accent"
              render={<NavLink to="/admin" />}
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-800 text-white shadow-2xs dark:bg-teal-600">
                <HeartPulseIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="text-sm font-bold tracking-tight">MedTrack</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Portail Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavStructures items={data.structures} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
