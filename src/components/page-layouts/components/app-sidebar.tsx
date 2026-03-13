"use client";

import * as React from "react";
import { BookOpenIcon, InfoIcon, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMainVertical } from "./nav-main-vertical";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "./logo";

export const navigationLinks = [
  {
    title: "Pages",
    type: "icon",
    items: [
      { url: "/", title: "Home", icon: BookOpenIcon },
      { url: "/pricing", title: "Pricing Page", icon: InfoIcon },
      { url: "/logout", title: "Logout", icon: LogOut },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainVertical items={navigationLinks} />
      </SidebarContent>
    </Sidebar>
  );
}
