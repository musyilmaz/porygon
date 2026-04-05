import Link from "next/link";

import { Logo } from "@/components/marketing/logo";
import { ScrollLink } from "@/components/marketing/scroll-link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs Arcade", href: "/compare/arcade" },
      { label: "vs Storylane", href: "/compare/storylane" },
      { label: "vs Supademo", href: "/compare/supademo" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-zinc-50/50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" aria-label="dot home">
              <Logo variant="dark" />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Interactive demos, made simple.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <ScrollLink
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </ScrollLink>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} dot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
