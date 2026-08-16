import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingHero } from "@/app/components/LandingHero";

describe("LandingHero", () => {
  it("renders the OneFit Resume landing message", () => {
    render(<LandingHero />);

    expect(
      screen.getByRole("heading", { name: /Build perfectly scaled, one-page resumes/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Import your Word template/i)).toBeInTheDocument();
  });
});
