"use client";

import * as React from "react";
import {
  CameraIcon,
  CalendarIcon,
  CarIcon,
  ClipboardListIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HandshakeIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MoonIcon,
  QrCodeIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UsersIcon,
  UserIcon,
} from "lucide-react";
import { CustomUserButton } from "@/components/custom-user-button";
import { ThemeToggleSimple } from "@/components/theme-toggle";

import { NavAccounting } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { OrganizationSwitcher } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Rides",
      url: "/rides",
      icon: CarIcon,
    },
    {
      title: "Events",
      url: "/events",
      icon: CalendarIcon,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: FolderIcon,
    },
    {
      title: "Users",
      url: "/users",
      icon: UsersIcon,
    },
    {
      title: "Chauffeurs",
      url: "/chauffeurs",
      icon: UserIcon,
    },
    {
      title: "Vehicles",
      url: "/cars",
      icon: CarIcon,
    },
    {
      title: "Partners",
      url: "/partners",
      icon: HandshakeIcon,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Get Help",
      url: "/help",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "/search",
      icon: SearchIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
  accounting: [
    {
      name: "Estimates",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Billings",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Balance",
      url: "#",
      icon: FileIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSwitcher
              organizationProfileUrl="/clients/:id"
              createOrganizationUrl="/clients/new"
              appearance={{
                elements: {
                  organizationSwitcherTrigger: {
                    "&:focus": {
                      boxShadow: "none",
                    },
                  },
                },
              }}
              afterCreateOrganizationUrl="/clients/:id"
              afterLeaveOrganizationUrl="/clients"
              afterSelectOrganizationUrl="/clients/:id"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAccounting items={data.accounting} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <CustomUserButton />
              <ThemeToggleSimple />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
