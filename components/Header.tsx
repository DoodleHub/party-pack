"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CloseIcon, ControllerIcon, MenuIcon } from "@/components/ui/Icon";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Games", href: "/games" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="relative border-b border-ink/5 bg-surface">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <ControllerIcon className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">PartyPack</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "border-b-2 border-primary pb-1 text-sm font-medium text-primary"
                  : "pb-1 text-sm font-medium text-ink/80 transition-colors hover:text-ink"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <Button variant="dark">Sign In</Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-alt md:hidden"
          >
            {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-1 border-t border-ink/5 bg-surface px-6 py-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "rounded-lg bg-primary-tint px-3 py-2.5 text-sm font-medium text-primary"
                  : "rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:bg-surface-alt hover:text-ink"
              }
            >
              {link.label}
            </Link>
          ))}
          <Button variant="dark" className="mt-2 w-full">
            Sign In
          </Button>
        </nav>
      )}
    </header>
  );
}
