"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ControllerIcon } from "@/components/ui/Icon";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Games", href: "/games" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-ink/5 bg-surface">
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

        <Button variant="dark">Sign In</Button>
      </div>
    </header>
  );
}
