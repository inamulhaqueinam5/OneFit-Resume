import { UserButton } from "@clerk/nextjs";
import { Brand } from "./Brand";

export function AppHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[var(--page-max-width)] items-center justify-between px-14 py-21 md:px-28">
      <Brand />
      <UserButton />
    </header>
  );
}
