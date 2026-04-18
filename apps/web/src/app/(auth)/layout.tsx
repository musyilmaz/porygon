import Link from "next/link";

import { Logo } from "@/components/marketing/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative grid min-h-svh grid-rows-[auto_1fr_auto]"
      style={{
        background:
          "radial-gradient(ellipse 1200px 600px at 50% -200px, var(--dot-wash), transparent 70%), var(--background)",
      }}
    >
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" aria-label="dot home">
          <Logo />
        </Link>
      </header>

      <main className="flex items-start justify-center px-6 pb-20 pt-10 sm:items-center sm:pt-0">
        {children}
      </main>

      <footer className="flex items-center justify-between px-8 py-6 font-mono text-[11px] tracking-[0.04em] text-ink-400">
        <span>USEDOT.IO</span>
        <span>PRIVACY · TERMS · SECURITY</span>
      </footer>
    </div>
  );
}
