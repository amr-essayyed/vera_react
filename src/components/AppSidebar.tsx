import { Link } from 'react-router-dom'

import { LayoutDashboard, UsersRound, Container, FileBox, Signpost, Percent, Box } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconHelp, IconInnerShadowTop, IconSearch, IconSettings } from '@tabler/icons-react'
import { NavMain } from './NavMain'
import { NavUser } from './nav-user'

const data = {
  user: {
    name: "VeraUser",
    email: "m@vera.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Master Orders",
      url: "master-orders",
      icon: FileBox,
    },
    {
      title: "Purchase Orders",
      url: "purchase-orders",
      icon: Box,
    },
    {
      title: "Sales",
      url: "sales",
      icon: Percent,
    },
    {
      title: "Customers",
      url: "customers",
      icon: UsersRound,
    },
    {
      title: "products",
      url: "products",
      icon: Box
    },
    {
      title: "Suppliers",
      url: "suppliers",
      icon: Container,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">VERA</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}