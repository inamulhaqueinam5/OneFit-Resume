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
});
