import Link from "next/link";

import { Logo } from "@/components/marketing/logo";
import { ScrollLink } from "@/components/marketing/scroll-link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "#" },
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
    title: "Company",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact", href: "mailto:hello@usedot.io" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:px-12">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="dot home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
              Interactive product demos that sell your product. Don&apos;t
              tell — show.
            </p>
            <div className="mono-label mt-5 !text-ink-400">usedot.io</div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="mono-label mb-4">{col.title}</div>
              <ul className="space-y-2.5">
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

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 font-mono text-[11px] tracking-[0.04em] text-ink-400 sm:flex-row">
          <span>© {new Date().getFullYear()} DOT LABS, INC.</span>
          <span>PRIVACY · TERMS · SECURITY · DPA</span>
        </div>
      </div>
    </footer>
  );
}
