import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mammoth from "mammoth";
import { describe, expect, it } from "vitest";
import { parseDocx } from "@/lib/resume/parse";

const TEMPLATE = resolve(process.cwd(), "public", "official-template.docx");

describe("official-template.docx", () => {
  it("converts to HTML without error", async () => {
    const buffer = readFileSync(TEMPLATE);
    const { value } = await mammoth.convertToHtml({ buffer });
    expect(value).toContain("<table>");
  });

  it("round-trips through the parser into all eight sections with no review items", async () => {
    const buffer = readFileSync(TEMPLATE);
    const { value } = await mammoth.convertToHtml({ buffer });
    const { resume, review } = parseDocx(value);

    expect(review).toEqual([]);
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
  });

  it("carries placeholder contact details", async () => {
    const buffer = readFileSync(TEMPLATE);
    const { value } = await mammoth.convertToHtml({ buffer });
    const { resume } = parseDocx(value);

    expect(resume.contact.name).toBe("Your Name");
    expect(resume.contact.email).toBe("you@example.com");
  });

  it("keeps education subtitle data (no silent drop)", async () => {
    const buffer = readFileSync(TEMPLATE);
    const { value } = await mammoth.convertToHtml({ buffer });
    const { resume } = parseDocx(value);

    const education = resume.sections.find((s) => s.catalogId === "education");
    const subtitle = education?.entries[0]?.fields.find((f) => f.kind === "subtitle");
    expect(subtitle).toBeDefined();
  });
});
