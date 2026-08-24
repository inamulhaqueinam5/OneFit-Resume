import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/app/components/AppHeader";

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button">Account</div>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AppHeader", () => {
  it("exposes Master Profile and Resume Documents navigation", () => {
    render(<AppHeader />);

    const master = screen.getByRole("link", { name: "Master Profile" });
    const documents = screen.getByRole("link", { name: "Resume Documents" });

    expect(master).toHaveAttribute("href", "/dashboard");
    expect(master).toHaveAttribute("aria-current", "page");
    expect(documents).toHaveAttribute("href", "/documents");
  });

  it("keeps navigation links keyboard-focusable", () => {
    render(<AppHeader />);

    const master = screen.getByRole("link", { name: "Master Profile" });
    const documents = screen.getByRole("link", { name: "Resume Documents" });

    master.focus();
    expect(master).toHaveFocus();
    documents.focus();
    expect(documents).toHaveFocus();
  });

  it("gives primary nav controls a minimum 44px touch target", () => {
    render(<AppHeader />);

    for (const name of ["Master Profile", "Resume Documents"] as const) {
      const link = screen.getByRole("link", { name });
      expect(link.className).toMatch(/min-h-\[44px\]|min-h-11/);
    }
  });
});
