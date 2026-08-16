export type TextRun = {
  text: string;
  bold: boolean;
  italic: boolean;
  href: string | null;
};

export type EntryField =
  | { kind: "title"; runs: TextRun[] }
  | { kind: "subtitle"; runs: TextRun[] }
  | { kind: "dates"; runs: TextRun[] }
  | { kind: "paragraph"; runs: TextRun[] }
  | { kind: "bullets"; items: TextRun[][] }
  | { kind: "tags"; items: string[] }
  | { kind: "text-line"; runs: TextRun[] };

export type EntryFieldKind = EntryField["kind"];

export type Entry = {
  id: string;
  fields: EntryField[];
};

export type Section = {
  id: string;
  catalogId: string;
  title: string;
  entries: Entry[];
  visible: boolean;
};

export type ContactLink = {
  label: string;
  href: string;
};

export type Contact = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  links: ContactLink[];
  availability: string;
};

export type ProfilePicture = {
  dataUrl: string;
};

export type SectionCatalogItem = {
  id: string;
  title: string;
  keywords: string[];
  fields: EntryFieldKind[];
};

export type SectionCatalog = SectionCatalogItem[];

export type ReviewItem = {
  kind: "unmatched-heading" | "unmatched-content" | "unmatched-image";
  text: string;
};

export type Resume = {
  id: string;
  contact: Contact;
  profilePicture: ProfilePicture | null;
  sections: Section[];
  compressionLevel: number;
};

export type ParseResult = {
  resume: Resume;
  review: ReviewItem[];
};

export const CUSTOM_SECTION_ID = "custom";

export const MAX_COMPRESSION_LEVEL = 100;

export const COMPRESSION_STEP = 10;
