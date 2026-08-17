import { fireEvent, render, screen } from "@testing-library/react";
import { MasterProfileEditor } from "@/app/dashboard/master-profile-editor";
import type { Resume } from "@/lib/resume";
import { describe, expect, it } from "vitest";

const resume: Resume = {
  id: "master-1",
  contact: {
    name: "Ada Lovelace",
    tagline: "Analytical Engine Programmer",
    email: "ada@example.com",
    phone: "",
    location: "London",
    links: [],
    availability: "",
  },
  profilePicture: null,
  compressionLevel: 100,
  sections: [
    {
      id: "experience-section",
      catalogId: "experience",
      title: "Experience",
      visible: true,
      entries: [
        {
          id: "experience-entry",
          fields: [
            {
              kind: "title",
              runs: [{ text: "Engineer", bold: true, italic: false, href: null }],
            },
          ],
        },
      ],
    },
  ],
};

describe("MasterProfileEditor", () => {
  it("updates Contact and Entry Fields in the live preview", () => {
    render(<MasterProfileEditor initialResume={resume} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Grace Hopper" },
    });
    fireEvent.change(
      screen.getByLabelText("Experience entry 1 Title text run 1 text"),
      { target: { value: "Staff Engineer" } },
    );

    expect(screen.getByRole("heading", { name: "Grace Hopper" })).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
  });

  it("adds and removes Contact links", () => {
    render(<MasterProfileEditor initialResume={resume} />);

    fireEvent.click(screen.getByRole("button", { name: "Add contact link" }));
    expect(screen.getByLabelText("Contact link 1 label")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Contact link 1 label"), {
      target: { value: "Portfolio" },
    });
    expect(screen.getByDisplayValue("Portfolio")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove contact link 1" }));
    expect(screen.queryByLabelText("Contact link 1 label")).not.toBeInTheDocument();
  });

  it("supports document-only tailoring without losing hidden data", () => {
    render(
      <MasterProfileEditor
        documentId="doc-1"
        documentMode
        documentName="Product Designer"
        initialResume={resume}
      />,
    );

    fireEvent.click(screen.getByLabelText("Show Experience section"));
    expect(screen.getByLabelText("Show Experience section")).not.toBeChecked();
    expect(screen.getByLabelText("Experience entry 1 Title text run 1 text")).toHaveValue("Engineer");
    fireEvent.click(screen.getByLabelText("Show Experience section"));
    expect(screen.getByLabelText("Show Experience section")).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Add Entry" }));
    expect(screen.getByLabelText("Experience entry 2 Title text run 1 text")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Experience entry 2" }));
    expect(screen.queryByLabelText("Experience entry 2 Title text run 1 text")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("New section type"), {
      target: { value: "custom" },
    });
    fireEvent.change(screen.getByLabelText("Custom section title"), {
      target: { value: "Awards" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByDisplayValue("Awards")).toBeInTheDocument();
    expect(screen.getByText("1 Entry")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Awards section" }));
    expect(screen.queryByDisplayValue("Awards")).not.toBeInTheDocument();
  });
});
