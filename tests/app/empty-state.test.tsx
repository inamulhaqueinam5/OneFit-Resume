import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/app/components/EmptyState";

describe("EmptyState", () => {
  it("shows a template download CTA", () => {
    render(<EmptyState />);

    const download = screen.getByRole("link", { name: /Download template/i });
    expect(download).toHaveAttribute("href", "/official-template.docx");
  });

  it("shows an import CTA", () => {
    render(<EmptyState />);

    const importLink = screen.getByRole("link", { name: /Import your template/i });
    expect(importLink).toHaveAttribute("href", "/import");
  });

  it("greets the signed-in user by name when provided", () => {
    render(<EmptyState name="Ada" />);

    expect(
      screen.getByRole("heading", { name: /Welcome, Ada/i }),
    ).toBeInTheDocument();
  });
});
