"use client";

import { Book, Compass, Layout, Paintbrush } from "lucide-react";
import { SidebarItem } from "./sidebar-item";

const guestRoutes = [
  /*{
    icon: Layout,
    label: "Dashboard",
    href: "/home/dashboard",
  },*/
  {
    icon: Layout,
    label: "Dashboard",
    href: "/home/tutorial",
  },
  {
    icon: Paintbrush,
    label: "Create",
    href: "/home/search",
  },
];
export const SidebarRoutes = () => {
  const routes = guestRoutes;
  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
