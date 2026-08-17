import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Brand } from "./Brand";

export function AppHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[var(--page-max-width)] items-center justify-between px-14 py-21 md:px-28">
      <Brand />
      <nav className="flex items-center gap-21 text-body text-charcoal">
        <Link
          href="/dashboard"
          className="transition-colors hover:text-forest-ink"
        >
          Master Profile
        </Link>
        <Link
          href="/documents"
          className="transition-colors hover:text-forest-ink"
        >
          Resume Documents
        </Link>
      </nav>
      <UserButton />
    </header>
  );
}
