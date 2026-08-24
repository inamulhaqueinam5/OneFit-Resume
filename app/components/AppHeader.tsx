"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Master Profile" },
  { href: "/documents", label: "Resume Documents" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative border-b border-rule bg-newsprint print:hidden">
      <div className="mx-auto flex w-full max-w-[var(--page-max-width)] items-center justify-between gap-4 px-4 py-3 md:px-7">
        <Link
          href="/dashboard"
          className="min-h-[44px] focus-visible:outline focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--focus-ring-color)]"
        >
          <Brand />
          <span className="sr-only">OneFit Resume home</span>
        </Link>

        <nav
          aria-label="Application"
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              Boolean(pathname?.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-[44px] items-center border border-transparent px-3 py-2 font-[family-name:var(--font-ui)] text-body text-ink transition-colors hover:border-ink focus-visible:outline focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--focus-ring-color)]",
                  active && "border-ink bg-paper-sunken",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="app-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
            <span className="sr-only">
              {open ? "Close navigation" : "Open navigation"}
            </span>
          </Button>
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-11 w-11 rounded-none border border-[var(--color-ink)]",
              },
            }}
          />
        </div>
      </div>

      {open ? (
        <nav
          id="app-mobile-nav"
          aria-label="Application mobile"
          className="absolute inset-x-0 top-full z-20 border-b border-t border-rule bg-newsprint md:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-col px-4 py-2">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                Boolean(pathname?.startsWith(`${item.href}/`));
              return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[44px] items-center border-b border-rule px-1 py-3 font-[family-name:var(--font-ui)] text-body text-ink last:border-b-0",
                    active && "font-semibold text-editorial",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
