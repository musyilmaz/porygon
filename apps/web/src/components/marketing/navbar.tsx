"use client";

import { Button } from "@porygon/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@porygon/ui/components/sheet";
import { cn } from "@porygon/ui/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/marketing/logo";
import { ScrollLink } from "@/components/marketing/scroll-link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Compare", href: "#compare" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-200",
        scrolled
          ? "border-b bg-background/90 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="dot home">
          <Logo variant={scrolled ? "dark" : "light"} />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-6">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <ScrollLink
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    scrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {link.label}
                </ScrollLink>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    scrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                scrolled
                  ? ""
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              )}
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              className={cn(
                scrolled
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "bg-white text-[#09090B] hover:bg-zinc-100"
              )}
              asChild
            >
              <Link href="/signup">Start Free</Link>
            </Button>
          </div>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden",
                !scrolled && "text-zinc-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              {navLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <ScrollLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </ScrollLink>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="flex flex-col gap-3 pt-4">
                <Button variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  className="bg-violet-600 text-white hover:bg-violet-700"
                  asChild
                >
                  <Link href="/signup">Start Free</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
