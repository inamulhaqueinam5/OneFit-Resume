import { describe, expect, it } from "vitest";
import {
  addEntry,
  addSection,
  cloneDocument,
  createEmptyResume,
  createFromMaster,
  removeEntry,
  removeSection,
  reorderEntries,
  reorderSections,
  setCompressionLevel,
  toggleSectionVisibility,
} from "@/lib/resume/operations";
import { CUSTOM_SECTION_ID } from "@/lib/resume/types";

function sampleResume() {
  let resume = createEmptyResume();
  resume = addSection(resume, { catalogId: "experience" });
  resume = addSection(resume, { catalogId: "education" });
  resume = addEntry(resume, resume.sections[0].id, [{ kind: "title", runs: [{ text: "Role", bold: true, italic: false, href: null }] }]);
  return resume;
}

describe("createFromMaster", () => {
  it("produces an independent copy with a fresh id and default compression", () => {
    const master = sampleResume();
    const document = createFromMaster(master);

    expect(document.id).not.toBe(master.id);
    expect(document.compressionLevel).toBe(100);

    const edited = toggleSectionVisibility(document, document.sections[0].id);
    expect(edited.sections[0].visible).toBe(false);
    expect(master.sections[0].visible).toBe(true);
  });
});

describe("cloneDocument", () => {
  it("deep-copies and preserves compression while staying independent", () => {
    const source = setCompressionLevel(sampleResume(), 70);
    const clone = cloneDocument(source);

    expect(clone.id).not.toBe(source.id);
    expect(clone.compressionLevel).toBe(70);
    expect(clone.sections.length).toBe(source.sections.length);

    const edited = removeSection(clone, clone.sections[0].id);
    expect(edited.sections.length).toBe(1);
    expect(source.sections.length).toBe(2);
  });
});

describe("toggleSectionVisibility", () => {
  it("flips a single section's visibility", () => {
    const resume = sampleResume();
    const toggled = toggleSectionVisibility(resume, resume.sections[0].id);
    expect(toggled.sections[0].visible).toBe(false);
    expect(toggled.sections[1].visible).toBe(true);
    expect(resume.sections[0].visible).toBe(true);
  });
});

describe("addSection / removeSection", () => {
  it("appends a catalog section", () => {
    const resume = createEmptyResume();
    const updated = addSection(resume, { catalogId: "skills" });
    expect(updated.sections).toHaveLength(1);
    expect(updated.sections[0].catalogId).toBe("skills");
    expect(updated.sections[0].title).toBe("Skills");
    expect(updated.sections[0].visible).toBe(true);
  });

  it("adds a custom section with a free title", () => {
    const resume = createEmptyResume();
    const updated = addSection(resume, { catalogId: CUSTOM_SECTION_ID, title: "Awards" });
    expect(updated.sections[0].catalogId).toBe(CUSTOM_SECTION_ID);
    expect(updated.sections[0].title).toBe("Awards");
  });

  it("inserts at the requested position", () => {
    let resume = createEmptyResume();
    resume = addSection(resume, { catalogId: "experience" });
    resume = addSection(resume, { catalogId: "education" });
    resume = addSection(resume, { catalogId: "skills" }, 1);
    expect(resume.sections.map((s) => s.catalogId)).toEqual(["experience", "skills", "education"]);
  });

  it("removes only the matching section", () => {
    const resume = sampleResume();
    const updated = removeSection(resume, resume.sections[0].id);
    expect(updated.sections).toHaveLength(1);
    expect(updated.sections[0].catalogId).toBe("education");
  });
});

describe("addEntry / removeEntry", () => {
  it("appends an entry with the given fields", () => {
    const resume = sampleResume();
    const sectionId = resume.sections[0].id;
    const updated = addEntry(resume, sectionId, [
      { kind: "subtitle", runs: [{ text: "Org", bold: false, italic: true, href: null }] },
    ]);
    expect(updated.sections[0].entries).toHaveLength(2);
    expect(updated.sections[0].entries[1].fields[0].kind).toBe("subtitle");
  });

  it("removes only the matching entry", () => {
    const resume = sampleResume();
    const entryId = resume.sections[0].entries[0].id;
    const updated = removeEntry(resume, resume.sections[0].id, entryId);
    expect(updated.sections[0].entries).toHaveLength(0);
  });
});

describe("reorderSections", () => {
  it("moves a section to a new index", () => {
    const resume = sampleResume();
    const updated = reorderSections(resume, 0, 1);
    expect(updated.sections.map((s) => s.catalogId)).toEqual(["education", "experience"]);
  });
});

describe("reorderEntries", () => {
  it("moves an entry within its section", () => {
    let resume = sampleResume();
    const sectionId = resume.sections[0].id;
    resume = addEntry(resume, sectionId, [
      { kind: "title", runs: [{ text: "Second", bold: true, italic: false, href: null }] },
    ]);
    const updated = reorderEntries(resume, sectionId, 0, 1);
    expect(updated.sections[0].entries[1].fields[0]).toMatchObject({ runs: [{ text: "Role" }] });
  });
});

describe("setCompressionLevel", () => {
  it("snaps to the nearest 10% step", () => {
    const resume = createEmptyResume();
    expect(setCompressionLevel(resume, 64).compressionLevel).toBe(60);
    expect(setCompressionLevel(resume, 66).compressionLevel).toBe(70);
    expect(setCompressionLevel(resume, 120).compressionLevel).toBe(100);
    expect(setCompressionLevel(resume, -10).compressionLevel).toBe(0);
  });
});
