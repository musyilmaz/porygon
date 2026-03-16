"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@porygon/ui/components/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

type RouteConfig = {
  label: string;
  parent?: string;
};

const routeConfig: Record<string, RouteConfig> = {
  "/dashboard": { label: "Dashboard" },
  "/dashboard/demos": { label: "Demos", parent: "/dashboard" },
  "/dashboard/analytics": { label: "Analytics", parent: "/dashboard" },
  "/dashboard/account": { label: "Account", parent: "/dashboard" },
  "/dashboard/settings": { label: "Settings", parent: "/dashboard" },
};

// Matches dynamic routes like /dashboard/demos/[id]/analytics
const dynamicRoutes: {
  pattern: RegExp;
  build: (match: RegExpMatchArray) => { label: string; href: string; parent: string }[];
}[] = [
  {
    pattern: /^\/dashboard\/demos\/[^/]+\/analytics$/,
    build: () => [
      { label: "Demo Analytics", href: "", parent: "/dashboard/analytics" },
    ],
  },
];

function buildBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href: string }[] = [];
  let current: string | undefined = pathname;

  // Check dynamic routes first
  for (const route of dynamicRoutes) {
    const match = pathname.match(route.pattern);
    if (match) {
      const segments = route.build(match);
      for (const seg of segments) {
        crumbs.push({ label: seg.label, href: seg.href || pathname });
      }
      // Walk up from parent
      current = segments[0]?.parent;
      while (current) {
        const config: RouteConfig | undefined = routeConfig[current];
        if (!config) break;
        crumbs.unshift({ label: config.label, href: current });
        current = config.parent;
      }
      return crumbs;
    }
  }

  // Static routes
  while (current) {
    const config: RouteConfig | undefined = routeConfig[current];
    if (!config) break;
    crumbs.unshift({ label: config.label, href: current });
    current = config.parent;
  }

  return crumbs;
}

export function BreadcrumbNav() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
