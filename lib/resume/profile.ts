import { CUSTOM_SECTION_ID, type ParseResult, type Resume } from "./types";
import { setCompressionLevel } from "./operations";

export type ImportAssessment = {
  isOfficialTemplate: boolean;
  warning: string | null;
};

export function assessImport(result: ParseResult): ImportAssessment {
  const unmatched = result.review.length > 0;
  const hasSections = result.resume.sections.length > 0;

  if (!unmatched && hasSections) {
    return { isOfficialTemplate: true, warning: null };
  }

  return {
    isOfficialTemplate: false,
    warning:
      "This file doesn't match the official OneFit template. Content was parsed best-effort — review the unmatched items before creating your Master Profile.",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isTextRun(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isString(value.text) &&
    typeof value.bold === "boolean" &&
    typeof value.italic === "boolean" &&
    (value.href === null || isString(value.href))
  );
}

function isTextRunArray(value: unknown): boolean {
  return Array.isArray(value) && value.every(isTextRun);
}

function isEntryField(value: unknown): boolean {
  if (!isRecord(value)) return false;
  switch (value.kind) {
    case "title":
    case "subtitle":
    case "dates":
    case "paragraph":
    case "text-line":
      return isTextRunArray(value.runs);
    case "bullets":
      return Array.isArray(value.items) && value.items.every(isTextRunArray);
    case "tags":
      return isStringArray(value.items);
    default:
      return false;
  }
}

function isEntry(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return isString(value.id) && Array.isArray(value.fields) && value.fields.every(isEntryField);
}

function isSection(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.catalogId) &&
    isString(value.title) &&
    Array.isArray(value.entries) &&
    value.entries.every(isEntry) &&
    typeof value.visible === "boolean"
  );
}

function isContactLink(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return isString(value.label) && isString(value.href);
}

function isContact(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isString(value.name) &&
    isString(value.tagline) &&
    isString(value.email) &&
    isString(value.phone) &&
    isString(value.location) &&
    Array.isArray(value.links) &&
    value.links.every(isContactLink) &&
    isString(value.availability)
  );
}

function isProfilePicture(value: unknown): boolean {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  return isString(value.dataUrl) && (value.publicId === undefined || isString(value.publicId));
}

export function deserializeResume(value: unknown): Resume {
  if (!isRecord(value)) {
    throw new Error("Invalid Master Profile: expected an object");
  }
  if (!isString(value.id)) {
    throw new Error("Invalid Master Profile: missing id");
  }
  if (!isContact(value.contact)) {
    throw new Error("Invalid Master Profile: missing or malformed contact");
  }
  if (!isProfilePicture(value.profilePicture)) {
    throw new Error("Invalid Master Profile: missing or malformed profilePicture");
  }
  if (!Array.isArray(value.sections) || !value.sections.every(isSection)) {
    throw new Error("Invalid Master Profile: missing or malformed sections");
  }
  if (typeof value.compressionLevel !== "number" || !Number.isFinite(value.compressionLevel)) {
    throw new Error("Invalid Master Profile: missing compressionLevel");
  }

  return setCompressionLevel(value as unknown as Resume, value.compressionLevel);
}

export function deserializeMasterProfile(value: unknown): Resume {
  const resume = deserializeResume(value);
  if (resume.sections.some((section) => section.catalogId === CUSTOM_SECTION_ID)) {
    throw new Error("Invalid Master Profile: Custom Sections belong to Resume Documents");
  }
  return resume;
}
