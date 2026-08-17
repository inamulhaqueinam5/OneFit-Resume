import { sectionCatalog } from "./catalog";
import { newId } from "./id";
import {
  CUSTOM_SECTION_ID,
  COMPRESSION_STEP,
  MAX_COMPRESSION_LEVEL,
  type Contact,
  type ContactLink,
  type Entry,
  type EntryField,
  type Resume,
  type Section,
} from "./types";

export type NewSection = {
  catalogId: string;
  title?: string;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createEmptyContact(): Contact {
  return {
    name: "",
    tagline: "",
    email: "",
    phone: "",
    location: "",
    links: [],
    availability: "",
  };
}

export function createEmptyResume(): Resume {
  return {
    id: newId(),
    contact: createEmptyContact(),
    profilePicture: null,
    sections: [],
    compressionLevel: MAX_COMPRESSION_LEVEL,
  };
}

type EditableContact = Omit<Contact, "links">;

export function updateContact(resume: Resume, patch: Partial<EditableContact>): Resume {
  return {
    ...resume,
    contact: { ...resume.contact, ...patch },
  };
}

export function addContactLink(resume: Resume, link: ContactLink, position?: number): Resume {
  const links = [...resume.contact.links];
  const index =
    position === undefined ? links.length : Math.max(0, Math.min(links.length, position));
  links.splice(index, 0, clone(link));
  return {
    ...resume,
    contact: { ...resume.contact, links },
  };
}

export function updateContactLink(
  resume: Resume,
  index: number,
  link: ContactLink,
): Resume {
  return {
    ...resume,
    contact: {
      ...resume.contact,
      links: resume.contact.links.map((current, currentIndex) =>
        currentIndex === index ? clone(link) : current,
      ),
    },
  };
}

export function removeContactLink(resume: Resume, index: number): Resume {
  return {
    ...resume,
    contact: {
      ...resume.contact,
      links: resume.contact.links.filter((_, currentIndex) => currentIndex !== index),
    },
  };
}

export function createFromMaster(master: Resume): Resume {
  return {
    ...clone(master),
    id: newId(),
    compressionLevel: MAX_COMPRESSION_LEVEL,
  };
}

export function cloneDocument(document: Resume): Resume {
  return {
    ...clone(document),
    id: newId(),
  };
}

export function toggleSectionVisibility(resume: Resume, sectionId: string): Resume {
  return {
    ...resume,
    sections: resume.sections.map((section) =>
      section.id === sectionId
        ? { ...section, visible: !section.visible }
        : section,
    ),
  };
}

export function updateSectionTitle(resume: Resume, sectionId: string, title: string): Resume {
  return {
    ...resume,
    sections: resume.sections.map((section) =>
      section.id === sectionId ? { ...section, title } : section,
    ),
  };
}

export function addSection(resume: Resume, spec: NewSection, position?: number): Resume {
  const section = buildSection(spec);
  const sections = [...resume.sections];
  const index =
    position === undefined ? sections.length : Math.max(0, Math.min(sections.length, position));
  sections.splice(index, 0, section);
  return { ...resume, sections };
}

function buildSection(spec: NewSection): Section {
  if (spec.catalogId === CUSTOM_SECTION_ID) {
    const title = spec.title?.trim();
    if (!title) {
      throw new Error("Custom section requires a title");
    }
    return {
      id: newId(),
      catalogId: CUSTOM_SECTION_ID,
      title,
      entries: [],
      visible: true,
    };
  }

  const catalogItem = sectionCatalog.find((item) => item.id === spec.catalogId);
  if (!catalogItem) {
    throw new Error(`Unknown catalog section: ${spec.catalogId}`);
  }

  return {
    id: newId(),
    catalogId: catalogItem.id,
    title: catalogItem.title,
    entries: [],
    visible: true,
  };
}

export function removeSection(resume: Resume, sectionId: string): Resume {
  return {
    ...resume,
    sections: resume.sections.filter((section) => section.id !== sectionId),
  };
}

export function addEntry(
  resume: Resume,
  sectionId: string,
  fields: EntryField[] = [],
  position?: number,
): Resume {
  const entry: Entry = { id: newId(), fields: clone(fields) };
  return {
    ...resume,
    sections: resume.sections.map((section) => {
      if (section.id !== sectionId) return section;
      const entries = [...section.entries];
      const index =
        position === undefined
          ? entries.length
          : Math.max(0, Math.min(entries.length, position));
      entries.splice(index, 0, entry);
      return { ...section, entries };
    }),
  };
}

export function removeEntry(resume: Resume, sectionId: string, entryId: string): Resume {
  return updateEntry(resume, sectionId, entryId, () => null);
}

function updateEntry(
  resume: Resume,
  sectionId: string,
  entryId: string,
  updater: (entry: Entry) => Entry | null,
): Resume {
  return {
    ...resume,
    sections: resume.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        entries: section.entries
          .map((entry) => (entry.id === entryId ? updater(entry) : entry))
          .filter((entry): entry is Entry => entry !== null),
      };
    }),
  };
}

export function updateEntryField(
  resume: Resume,
  sectionId: string,
  entryId: string,
  fieldIndex: number,
  field: EntryField,
): Resume {
  return updateEntry(resume, sectionId, entryId, (entry) => ({
    ...entry,
    fields: entry.fields.map((current, currentIndex) =>
      currentIndex === fieldIndex ? clone(field) : current,
    ),
  }));
}

export function addEntryField(
  resume: Resume,
  sectionId: string,
  entryId: string,
  field: EntryField,
  position?: number,
): Resume {
  return updateEntry(resume, sectionId, entryId, (entry) => {
    const fields = [...entry.fields];
    const index =
      position === undefined ? fields.length : Math.max(0, Math.min(fields.length, position));
    fields.splice(index, 0, clone(field));
    return { ...entry, fields };
  });
}

export function removeEntryField(
  resume: Resume,
  sectionId: string,
  entryId: string,
  fieldIndex: number,
): Resume {
  return updateEntry(resume, sectionId, entryId, (entry) => ({
    ...entry,
    fields: entry.fields.filter((_, index) => index !== fieldIndex),
  }));
}

export function reorderSections(resume: Resume, fromIndex: number, toIndex: number): Resume {
  const sections = [...resume.sections];
  const [moved] = sections.splice(fromIndex, 1);
  sections.splice(toIndex, 0, moved);
  return { ...resume, sections };
}

export function reorderEntries(
  resume: Resume,
  sectionId: string,
  fromIndex: number,
  toIndex: number,
): Resume {
  return {
    ...resume,
    sections: resume.sections.map((section) => {
      if (section.id !== sectionId) return section;
      const entries = [...section.entries];
      const [moved] = entries.splice(fromIndex, 1);
      entries.splice(toIndex, 0, moved);
      return { ...section, entries };
    }),
  };
}

export function setCompressionLevel(resume: Resume, level: number): Resume {
  const clamped = Math.min(MAX_COMPRESSION_LEVEL, Math.max(0, level));
  const snapped = Math.round(clamped / COMPRESSION_STEP) * COMPRESSION_STEP;
  return { ...resume, compressionLevel: snapped };
}
