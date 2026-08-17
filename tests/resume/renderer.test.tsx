import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import type { Resume, TextRun } from "@/lib/resume";

const runs = (text: string, options: Partial<TextRun> = {}): TextRun[] => [
  { text, bold: false, italic: false, href: null, ...options },
];

const resume: Resume = {
  id: "resume-1",
  contact: {
    name: "Ada Lovelace",
    tagline: "Analytical Engine Programmer",
    email: "ada@example.com",
    phone: "+44 20 0000 0000",
    location: "London, UK",
    links: [{ label: "Portfolio", href: "https://ada.example.com" }],
    availability: "Available immediately",
  },
  profilePicture: { dataUrl: "data:image/png;base64,photo" },
  compressionLevel: 90,
  sections: [
    {
      id: "summary",
      catalogId: "professional-summary",
      title: "Professional Summary",
      visible: true,
      entries: [{ id: "summary-entry", fields: [{ kind: "paragraph", runs: runs("A concise summary.") }] }],
    },
    {
      id: "experience",
      catalogId: "experience",
      title: "Experience",
      visible: true,
      entries: [
        {
          id: "experience-entry",
          fields: [
            { kind: "title", runs: runs("Senior Engineer", { bold: true }) },
            { kind: "subtitle", runs: runs("Example Labs") },
            { kind: "dates", runs: runs("2020 - Present") },
            { kind: "bullets", items: [runs("Built a compiler."), runs("Led a team.")] },
          ],
        },
      ],
    },
    {
      id: "skills",
      catalogId: "skills",
      title: "Skills",
      visible: true,
      entries: [{ id: "skills-entry", fields: [{ kind: "title", runs: runs("Languages") }, { kind: "tags", items: ["TypeScript", "SQL"] }] }],
    },
    {
      id: "hidden",
      catalogId: "projects",
      title: "Projects",
      visible: false,
      entries: [{ id: "hidden-entry", fields: [{ kind: "title", runs: runs("Should not render") }] }],
    },
    {
      id: "references",
      catalogId: "references",
      title: "References",
      visible: true,
      entries: [{ id: "reference-entry", fields: [{ kind: "title", runs: runs("Grace Hopper") }, { kind: "text-line", runs: runs("grace@example.com") }] }],
    },
  ],
};

const completeResume: Resume = {
  ...resume,
  sections: [
    resume.sections[0],
    resume.sections[1],
    {
      id: "education",
      catalogId: "education",
      title: "Education",
      visible: true,
      entries: [{ id: "education-entry", fields: [{ kind: "title", runs: runs("BSc Computer Science") }, { kind: "subtitle", runs: runs("University\n2016 - 2020") }] }],
    },
    resume.sections[2],
    {
      id: "projects",
      catalogId: "projects",
      title: "Projects",
      visible: true,
      entries: [{ id: "projects-entry", fields: [{ kind: "title", runs: runs("Compiler") }, { kind: "bullets", items: [runs("Built it.")] }] }],
    },
    {
      id: "publications",
      catalogId: "publications",
      title: "Publications",
      visible: true,
      entries: [{ id: "publications-entry", fields: [{ kind: "text-line", runs: runs("A published paper") }] }],
    },
    {
      id: "extracurricular",
      catalogId: "extracurricular-activities",
      title: "Extracurricular Activities",
      visible: true,
      entries: [{ id: "extracurricular-entry", fields: [{ kind: "title", runs: runs("Mentor") }, { kind: "dates", runs: runs("2021") }, { kind: "bullets", items: [runs("Taught students.")] }] }],
    },
    resume.sections[4],
  ],
};

describe("ResumeRenderer", () => {
  it("renders the header, typed fields, links, and profile picture", () => {
    render(<ResumeRenderer resume={resume} />);

    expect(screen.getByRole("document")).toHaveAttribute("data-compression-level", "90");
    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("A concise summary.")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Example Labs")).toBeInTheDocument();
    expect(screen.getByText("2020 - Present")).toBeInTheDocument();
    expect(screen.getAllByRole("list")[0]).toHaveTextContent("Built a compiler.");
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute("href", "https://ada.example.com");
    expect(screen.getByRole("img", { name: "Ada Lovelace profile picture" })).toHaveAttribute("src", resume.profilePicture?.dataUrl);
  });

  it("does not render hidden sections and preserves run formatting", () => {
    render(
      <ResumeRenderer
        resume={{
          ...resume,
          sections: resume.sections.map((section) =>
            section.id === "summary"
              ? { ...section, entries: [{ id: "formatted", fields: [{ kind: "paragraph", runs: [runs("Bold", { bold: true })[0], runs(" italic", { italic: true })[0]] }] }] }
              : section,
          ),
        }}
      />,
    );

    expect(screen.queryByText("Should not render")).not.toBeInTheDocument();
    expect(screen.getByText("Bold").tagName).toBe("STRONG");
    expect(screen.getByText("italic", { exact: false }).tagName).toBe("EM");
  });

  it("renders all eight template sections with their section-specific layouts", () => {
    render(<ResumeRenderer resume={completeResume} />);

    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "Professional Summary",
      "Experience",
      "Education",
      "Skills",
      "Projects",
      "Publications",
      "Extracurricular Activities",
      "References",
    ]);
    expect(screen.getByText("A published paper").parentElement?.tagName).toBe("P");
    expect(screen.getByText(/University/).parentElement?.className).toContain("subtitle");
  });
});
