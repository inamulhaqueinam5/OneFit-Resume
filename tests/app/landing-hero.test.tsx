import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingHero } from "@/app/components/LandingHero";

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

describe("LandingHero", () => {
  it("preserves the primary product heading and import pitch", () => {
    render(<LandingHero />);

    expect(
      screen.getByRole("heading", {
        name: /Build perfectly scaled, one-page resumes/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Import your Word template/i)).toBeInTheDocument();
  });

  it("keeps signed-out CTAs to sign-up and sign-in", () => {
    render(<LandingHero signedIn={false} />);

    const getStarted = screen.getAllByRole("link", { name: /Get started/i });
    expect(getStarted.length).toBeGreaterThan(0);
    expect(getStarted.every((link) => link.getAttribute("href") === "/sign-up")).toBe(
      true,
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    expect(screen.getByRole("link", { name: /Start free/i })).toHaveAttribute(
      "href",
      "/sign-up",
    );
  });

  it("routes signed-in visitors to the dashboard", () => {
    render(<LandingHero signedIn />);

    const dashboard = screen.getAllByRole("link", { name: /Go to dashboard/i });
    expect(dashboard.length).toBeGreaterThan(0);
    expect(dashboard.every((link) => link.getAttribute("href") === "/dashboard")).toBe(
      true,
    );
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("retains feature and how-it-works section anchors", () => {
    render(<LandingHero />);

    expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute(
      "href",
      "#features",
    );
    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute(
      "href",
      "#how",
    );
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute(
      "href",
      "#faq",
    );
    expect(
      screen.getByRole("link", { name: "See how it works" }),
    ).toHaveAttribute("href", "#how");
  });
});
