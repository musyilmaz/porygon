"use client";

import { Separator } from "@porygon/ui/components/separator";
import { SidebarTrigger } from "@porygon/ui/components/sidebar";

import { BreadcrumbNav } from "./breadcrumb-nav";

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNav />
      </div>
    </header>
  );
}
