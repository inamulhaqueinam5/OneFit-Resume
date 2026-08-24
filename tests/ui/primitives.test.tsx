import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconBox } from "@/components/ui/icon-box";
import { Dialog } from "@/components/ui/dialog";
import { Status } from "@/components/ui/status";

describe("Newsprint UI primitives", () => {
  it("Button exposes an accessible name and default button role", () => {
    render(<Button>Save changes</Button>);
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });

  it("Button outline variant remains a named button", () => {
    render(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("Input is labeled when paired with Label", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("Card renders its children as a region when labeled", () => {
    render(
      <Card aria-label="Document summary">
        <p>Product Designer</p>
      </Card>,
    );
    expect(
      screen.getByRole("region", { name: "Document summary" }),
    ).toHaveTextContent("Product Designer");
  });

  it("IconBox exposes an accessible name for icon-only chrome", () => {
    render(
      <IconBox label="Open menu">
        <span aria-hidden="true">≡</span>
      </IconBox>,
    );
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("Dialog exposes dialog semantics and title", () => {
    render(
      <Dialog open title="Delete Resume Document">
        <p>This cannot be undone.</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog", { name: "Delete Resume Document" })).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("Status announces messages with status role", () => {
    render(<Status tone="error">Save failed. Try again.</Status>);
    expect(screen.getByRole("status")).toHaveTextContent("Save failed. Try again.");
  });
});
