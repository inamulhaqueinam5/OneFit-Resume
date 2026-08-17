import { describe, expect, it } from "vitest";
import {
  addContactLink,
  removeContactLink,
  updateContact,
  updateContactLink,
  updateEntryField,
  updateSectionTitle,
} from "@/lib/resume/operations";
import { createEmptyResume, addEntry, addSection } from "@/lib/resume/operations";

function sampleResume() {
  let resume = createEmptyResume();
  resume = updateContact(resume, {
    name: "Ada Lovelace",
    email: "ada@example.com",
  });
  resume = addContactLink(resume, { label: "Portfolio", href: "https://ada.example.com" });
  resume = addSection(resume, { catalogId: "experience" });
  resume = addEntry(resume, resume.sections[0].id, [
    { kind: "title", runs: [{ text: "Engineer", bold: true, italic: false, href: null }] },
  ]);
  return resume;
}

describe("Master Profile editing operations", () => {
  it("updates Contact fields and links without mutating the previous profile", () => {
    const original = sampleResume();
    const updated = updateContactLink(
      updateContact(original, { phone: "+44 20 0000 0000" }),
      0,
      { label: "Work", href: "https://work.example.com" },
    );

    expect(updated.contact.phone).toBe("+44 20 0000 0000");
    expect(updated.contact.links[0]).toEqual({
      label: "Work",
      href: "https://work.example.com",
    });
    expect(original.contact.phone).toBe("");
    expect(original.contact.links[0].label).toBe("Portfolio");

    const withoutLink = removeContactLink(updated, 0);
    expect(withoutLink.contact.links).toEqual([]);
    expect(updated.contact.links).toHaveLength(1);
  });

  it("updates a Section title and any typed Entry Field", () => {
    const original = sampleResume();
    const sectionId = original.sections[0].id;
    const entryId = original.sections[0].entries[0].id;
    const updated = updateEntryField(
      updateSectionTitle(original, sectionId, "Work Experience"),
      sectionId,
      entryId,
      0,
      { kind: "title", runs: [{ text: "Staff Engineer", bold: true, italic: false, href: null }] },
    );

    expect(updated.sections[0].title).toBe("Work Experience");
    expect(updated.sections[0].entries[0].fields[0]).toMatchObject({
      kind: "title",
      runs: [{ text: "Staff Engineer" }],
    });
    expect(original.sections[0].title).toBe("Experience");
    expect(original.sections[0].entries[0].fields[0]).toMatchObject({
      runs: [{ text: "Engineer" }],
    });
  });
});
