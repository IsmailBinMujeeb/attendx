import * as React from "react";
import {
  MessageCircleQuestion,
  Users,
  Clock8,
  LogOut,
  BookA,
  Rss,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Students",
      url: "/students",
      icon: Users,
    },
    {
      title: "Lectures",
      url: "/lectures",
      icon: Clock8,
    },
    {
      title: "Subjects",
      url: "/subjects",
      icon: BookA,
    },
    {
      title: "Classes",
      url: "/classes",
      icon: Rss,
    },
  ],
  navSecondary: [
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
    {
      title: "Logout",
      url: "/logout",
      icon: LogOut,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
