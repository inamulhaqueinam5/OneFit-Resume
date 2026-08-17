import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { assessImport, deserializeResume } from "@/lib/resume/profile";
import { parseDocx } from "@/lib/resume/parse";

const FIXTURE = readFileSync(
  resolve(__dirname, "fixtures", "official-template.html"),
  "utf8",
);

describe("assessImport", () => {
  it("flags the official template as official with no warning", () => {
    const result = parseDocx(FIXTURE);
    const assessment = assessImport(result);

    expect(assessment.isOfficialTemplate).toBe(true);
    expect(assessment.warning).toBeNull();
  });

  it("flags an unrecognised file as best-effort with a warning", () => {
    const result = parseDocx("<p><strong>AWARDS</strong></p><p>Employee of the Month 2025</p>");
    const assessment = assessImport(result);

    expect(assessment.isOfficialTemplate).toBe(false);
    expect(assessment.warning).toBeTruthy();
  });

  it("flags a file that matches no sections as best-effort", () => {
    const result = parseDocx("<p>Just some stray text</p>");
    const assessment = assessImport(result);

    expect(assessment.isOfficialTemplate).toBe(false);
    expect(assessment.warning).toBeTruthy();
  });
});

describe("deserializeResume", () => {
  it("round-trips a fully parsed resume", () => {
    const { resume } = parseDocx(FIXTURE);
    const json = JSON.parse(JSON.stringify(resume)) as unknown;
    expect(deserializeResume(json)).toEqual(resume);
  });

  it("rejects null", () => {
    expect(() => deserializeResume(null)).toThrow();
  });

  it("rejects non-object values", () => {
    expect(() => deserializeResume("resume")).toThrow();
    expect(() => deserializeResume(42)).toThrow();
  });

  it("rejects a value missing contact", () => {
    const { resume } = parseDocx(FIXTURE);
    const json = JSON.parse(JSON.stringify(resume)) as Record<string, unknown>;
    delete json.contact;
    expect(() => deserializeResume(json)).toThrow();
  });

  it("rejects a value missing sections", () => {
    const { resume } = parseDocx(FIXTURE);
    const json = JSON.parse(JSON.stringify(resume)) as Record<string, unknown>;
    delete json.sections;
    expect(() => deserializeResume(json)).toThrow();
  });

  it("rejects an entry field with an unknown kind", () => {
    const json = {
      id: "r1",
      contact: {
        name: "",
        tagline: "",
        email: "",
        phone: "",
        location: "",
        links: [],
        availability: "",
      },
      profilePicture: null,
      compressionLevel: 100,
      sections: [
        {
          id: "s1",
          catalogId: "experience",
          title: "Experience",
          visible: true,
          entries: [
            { id: "e1", fields: [{ kind: "unknown-field", foo: "bar" }] },
          ],
        },
      ],
    } as unknown;
    expect(() => deserializeResume(json)).toThrow();
  });

  it("normalizes persisted compression to the supported ten-percent range", () => {
    const { resume } = parseDocx(FIXTURE);
    const json = JSON.parse(JSON.stringify(resume)) as Record<string, unknown>;

    json.compressionLevel = 95;
    expect(deserializeResume(json).compressionLevel).toBe(100);

    json.compressionLevel = 4;
    expect(deserializeResume(json).compressionLevel).toBe(10);
  });

  it("rejects non-finite persisted compression values", () => {
    const { resume } = parseDocx(FIXTURE);
    const json = JSON.parse(JSON.stringify(resume)) as Record<string, unknown>;

    json.compressionLevel = Number.NaN;
    expect(() => deserializeResume(json)).toThrow();
  });
});
