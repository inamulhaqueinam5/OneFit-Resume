export * from "./types";
export { sectionCatalog } from "./catalog";
export { parseDocx } from "./parse";
export { assessImport, deserializeMasterProfile, deserializeResume } from "./profile";
export {
  addEntry,
  addEntryField,
  addContactLink,
  addSection,
  cloneDocument,
  createEmptyContact,
  createEmptyResume,
  createFromMaster,
  removeEntry,
  removeEntryField,
  removeContactLink,
  removeSection,
  reorderEntries,
  reorderSections,
  setCompressionLevel,
  toggleSectionVisibility,
  updateContact,
  updateContactLink,
  updateEntryField,
  updateSectionTitle,
} from "./operations";
export type { NewSection } from "./operations";
