import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDocx } from "@/lib/resume/parse";
import type { Entry, EntryField, TextRun } from "@/lib/resume/types";

const FIXTURE = readFileSync(
  resolve(__dirname, "fixtures", "official-template.html"),
  "utf8",
);

function text(runs: TextRun[]): string {
  return runs.map((run) => run.text).join("");
}

function fieldsOf(entry: Entry): Record<string, EntryField> {
  return Object.fromEntries(entry.fields.map((field) => [field.kind, field]));
}

function runs(field: EntryField | undefined): TextRun[] {
  return field && "runs" in field ? field.runs : [];
}

function bulletItems(field: EntryField | undefined): TextRun[][] {
  return field && field.kind === "bullets" ? field.items : [];
}

function tagItems(field: EntryField | undefined): string[] {
  return field && field.kind === "tags" ? field.items : [];
}

describe("parseDocx on the official template", () => {
  const { resume, review } = parseDocx(FIXTURE);

  it("produces no unmatched content for the official template", () => {
    expect(review).toEqual([]);
  });

  it("extracts the contact header", () => {
    expect(resume.contact).toEqual({
      name: "INAMUL HAQUE INAM",
      tagline: "Computer Science Graduate | Technical Researcher",
      email: "inamulhaqueinam5@gmail.com",
      phone: "+8801515259613",
      location: "Middle Badda, Dhaka, Bangladesh",
      links: [
        { label: "LinkedIn", href: "https://www.linkedin.com/in/inamulhaqueinam5/" },
        { label: "Facebook", href: "https://www.facebook.com/inamul.haque.inam.2024/" },
        { label: "GitHub", href: "https://github.com/inamulhaqueinam5" },
      ],
      availability: "Full-Time (Flexible with shifting schedules, including night shifts)",
    });
  });

  it("extracts the profile picture as a data URL", () => {
    expect(resume.profilePicture?.dataUrl.startsWith("data:image/jpeg;base64,")).toBe(true);
  });

  it("maps every official-template heading to a catalog section", () => {
    expect(resume.sections.map((section) => section.catalogId)).toEqual([
      "professional-summary",
      "experience",
      "education",
      "skills",
      "projects",
      "publications",
      "extracurricular-activities",
      "references",
    ]);
    expect(resume.sections.map((section) => section.title)).toEqual([
      "Professional Summary",
      "Experience",
      "Education",
      "Skills",
      "Projects",
      "Publications",
      "Extracurricular Activities",
      "References",
    ]);
  });

  it("parses experience entries into title, subtitle, dates and bullets", () => {
    const experience = resume.sections.find((s) => s.catalogId === "experience");
    expect(experience?.entries).toHaveLength(2);

    const fields = fieldsOf(experience!.entries[0]);
    expect(text(runs(fields.title))).toBe("Technical Operations Associate (Intern)");
    expect(text(runs(fields.subtitle))).toBe("Rectangle International AB (Sweden) (Remote)");
    expect(text(runs(fields.dates))).toBe("Mar 2026 – May 2026");
    expect(bulletItems(fields.bullets)).toHaveLength(3);
  });

  it("captures run-level bold within bullets", () => {
    const experience = resume.sections.find((s) => s.catalogId === "experience");
    const bullets = bulletItems(fieldsOf(experience!.entries[0]).bullets);
    expect(bullets[0][0]).toMatchObject({ text: "Operations Oversight: ", bold: true });
    expect(bullets[0][1]).toMatchObject({ bold: false });
  });

  it("parses education entries into title, subtitle and dates", () => {
    const education = resume.sections.find((s) => s.catalogId === "education");
    expect(education?.entries).toHaveLength(3);

    const fields = fieldsOf(education!.entries[0]);
    expect(text(runs(fields.title))).toBe("BSc in Computer Science & Engineering");
    expect(text(runs(fields.dates))).toBe("Feb 2022 – July 2026");
    expect(text(runs(fields.subtitle))).toBe("Southeast University | CGPA: 3.59 / 4.00");
  });

  it("parses skills into titled tag groups", () => {
    const skills = resume.sections.find((s) => s.catalogId === "skills");
    expect(skills?.entries).toHaveLength(7);

    const fields = fieldsOf(skills!.entries[0]);
    expect(text(runs(fields.title))).toBe("Strategic Leadership & Communication");
    expect(tagItems(fields.tags)).toEqual([
      "Cross-functional Collaboration",
      "Stakeholder Communication",
      "Team Leadership",
      "Mentoring",
      "Executive Presentation",
      "Agile Methodologies",
      "Change Management",
    ]);
  });

  it("parses projects with links preserved in subtitle runs", () => {
    const projects = resume.sections.find((s) => s.catalogId === "projects");
    expect(projects?.entries).toHaveLength(1);

    const fields = fieldsOf(projects!.entries[0]);
    expect(text(runs(fields.title))).toBe("SkillBridge");
    expect(runs(fields.subtitle).some((run) => run.href === "https://skillbridge-frontend-mocha.vercel.app/")).toBe(true);
  });

  it("parses publications as text-line entries", () => {
    const publications = resume.sections.find((s) => s.catalogId === "publications");
    expect(publications?.entries).toHaveLength(5);
    const first = fieldsOf(publications!.entries[0]);
    expect(text(runs(first["text-line"]))).toContain(
      "Mortality Risk Classification in Hepatitis B Patients",
    );
  });

  it("parses extracurricular activities and references", () => {
    const extracurricular = resume.sections.find(
      (s) => s.catalogId === "extracurricular-activities",
    );
    expect(extracurricular?.entries).toHaveLength(1);
    expect(text(runs(fieldsOf(extracurricular!.entries[0]).dates))).toBe("Jan 2026 – Apr 2026");

    const references = resume.sections.find((s) => s.catalogId === "references");
    expect(references?.entries).toHaveLength(1);
    expect(text(runs(fieldsOf(references!.entries[0]).title))).toBe(
      "Prof. Dr. Md. Mofazzal Hossain",
    );
  });
});

describe("parseDocx review bucket", () => {
  it("collects an unrecognised heading and its content into the review bucket", () => {
    const html = "<p><strong>AWARDS</strong></p><p>Employee of the Month 2025</p>";
    const { resume, review } = parseDocx(html);

    expect(resume.sections).toHaveLength(0);
    expect(review).toEqual([
      { kind: "unmatched-heading", text: "awards" },
      { kind: "unmatched-content", text: "employee of the month 2025" },
    ]);
  });

  it("collects content before any heading as unmatched", () => {
    const { review } = parseDocx("<p>Some stray paragraph</p>");
    expect(review).toEqual([{ kind: "unmatched-content", text: "some stray paragraph" }]);
  });

  it("collects an image outside the contact header as unmatched", () => {
    const { review } = parseDocx('<img src="https://example.com/photo.png" />');
    expect(review).toEqual([
      { kind: "unmatched-image", text: "https://example.com/photo.png" },
    ]);
  });
});

describe("parseDocx heading synonyms", () => {
  it("maps the 'Work History' synonym to the Experience section", () => {
    const { resume, review } = parseDocx(
      "<p><strong>Work History</strong></p><p>Acme Corp</p>",
    );

    expect(resume.sections.map((section) => section.catalogId)).toEqual(["experience"]);
    expect(resume.sections[0].title).toBe("Experience");
    expect(review).toEqual([]);
  });

  it("maps a synonym heading for every section without loss", () => {
    const html = [
      "<p><strong>Profile</strong></p><p>I am a developer.</p>",
      "<p><strong>Employment History</strong></p><p>Acme Corp</p>",
      "<p><strong>Academic Background</strong></p><p>BSc</p>",
      "<p><strong>Technical Skills</strong></p><p><strong>Languages</strong> Java, TypeScript</p>",
      "<p><strong>Project Experience</strong></p><p>SkillBridge</p>",
      "<p><strong>Research Publications</strong></p><p>Paper one</p>",
      "<p><strong>Leadership and Activities</strong></p><p>Volunteer</p>",
      "<p><strong>Recommendations</strong></p><p>Prof. X</p>",
    ].join("");

    const { resume, review } = parseDocx(html);

    expect(resume.sections.map((section) => section.catalogId)).toEqual([
      "professional-summary",
      "experience",
      "education",
      "skills",
      "projects",
      "publications",
      "extracurricular-activities",
      "references",
    ]);
    expect(review).toEqual([]);
  });
});
