"use client";

import { useState, type ReactNode } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import {
  addContactLink,
  addEntry,
  addEntryField,
  addSection,
  removeContactLink,
  removeEntry,
  removeEntryField,
  removeSection,
  reorderEntries,
  reorderSections,
  sectionCatalog,
  setCompressionLevel,
  toggleSectionVisibility,
  updateContact,
  updateContactLink,
  updateEntryField,
  updateSectionTitle,
  COMPRESSION_STEP,
  CUSTOM_SECTION_ID,
  MAX_COMPRESSION_LEVEL,
  type Contact,
  type ContactLink,
  type EntryField,
  type EntryFieldKind,
  type Resume,
  type TextRun,
} from "@/lib/resume";
import { persistMasterProfile, sendMasterProfileBeacon } from "./master-profile-api";
import { useAutosave, type AutosaveStatus } from "./use-autosave";
import { persistResumeDocument, sendResumeDocumentBeacon } from "@/app/documents/document-api";

type EditableContactField = Exclude<keyof Contact, "links">;
type RunsField = Extract<EntryField, { runs: TextRun[] }>;

const compressionButtonClass =
  "inline-flex h-35 w-35 items-center justify-center rounded-nav border border-border-mist bg-cream-paper text-forest-ink hover:text-forest-shadow disabled:opacity-50";

const contactFields: Array<{
  key: EditableContactField;
  label: string;
  multiline?: boolean;
  type?: "email" | "tel";
}> = [
  { key: "name", label: "Name" },
  { key: "tagline", label: "Tagline" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "location", label: "Location" },
  { key: "availability", label: "Availability", multiline: true },
];

function emptyRun(): TextRun {
  return { text: "", bold: false, italic: false, href: null };
}

function emptyField(kind: EntryFieldKind): EntryField {
  switch (kind) {
    case "bullets":
      return { kind, items: [] };
    case "tags":
      return { kind, items: [] };
    default:
      return { kind, runs: [emptyRun()] };
  }
}

function fieldsForSection(catalogId: string): EntryField[] {
  const catalogItem = sectionCatalog.find((item) => item.id === catalogId);
  return (catalogItem?.fields ?? ["paragraph"]).map(emptyField);
}

function fieldLabel(kind: EntryFieldKind): string {
  return kind
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isRunsField(field: EntryField): field is RunsField {
  return "runs" in field;
}

function RunListEditor({
  runs,
  label,
  multiline,
  onChange,
}: {
  runs: TextRun[];
  label: string;
  multiline?: boolean;
  onChange: (runs: TextRun[]) => void;
}) {
  const visibleRuns = runs.length > 0 ? runs : [emptyRun()];

  function updateRun(index: number, patch: Partial<TextRun>) {
    onChange(
      visibleRuns.map((run, runIndex) =>
        runIndex === index ? { ...run, ...patch } : run,
      ),
    );
  }

  function removeRun(index: number) {
    onChange(runs.filter((_, runIndex) => runIndex !== index));
  }

  return (
    <div className="flex flex-col gap-9">
      {visibleRuns.map((run, index) => {
        const runLabel = `${label} text run ${index + 1}`;
        return (
          <div
            className="flex flex-col gap-9 rounded-cards border border-border-mist bg-cream-paper p-14"
            key={`${runLabel}-${index}`}
          >
            {multiline ? (
              <textarea
                aria-label={`${runLabel} text`}
                className="min-h-70 w-full resize-y rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body text-charcoal outline-none focus:border-forest-ink"
                value={run.text}
                onChange={(event) => updateRun(index, { text: event.target.value })}
              />
            ) : (
              <input
                aria-label={`${runLabel} text`}
                className="w-full rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body text-charcoal outline-none focus:border-forest-ink"
                value={run.text}
                onChange={(event) => updateRun(index, { text: event.target.value })}
              />
            )}
            <div className="flex flex-wrap items-center gap-14 text-caption text-charcoal">
              <label className="inline-flex items-center gap-7">
                <input
                  aria-label={`${runLabel} bold`}
                  type="checkbox"
                  checked={run.bold}
                  onChange={(event) => updateRun(index, { bold: event.target.checked })}
                />
                Bold
              </label>
              <label className="inline-flex items-center gap-7">
                <input
                  aria-label={`${runLabel} italic`}
                  type="checkbox"
                  checked={run.italic}
                  onChange={(event) => updateRun(index, { italic: event.target.checked })}
                />
                Italic
              </label>
              <input
                aria-label={`${runLabel} link`}
                className="min-w-40 flex-1 rounded-nav border border-border-mist bg-cream-paper px-9 py-7 text-caption text-charcoal outline-none focus:border-forest-ink"
                placeholder="https://..."
                value={run.href ?? ""}
                onChange={(event) => updateRun(index, { href: event.target.value || null })}
              />
              <button
                aria-label={`${runLabel} remove`}
                className="inline-flex items-center gap-7 text-forest-ink hover:text-forest-shadow"
                type="button"
                onClick={() => removeRun(index)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        );
      })}
      <button
        className="inline-flex w-fit items-center gap-7 text-caption font-semibold text-forest-ink hover:text-forest-shadow"
        type="button"
        onClick={() => onChange([...runs, emptyRun()])}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add text run
      </button>
    </div>
  );
}

function RunsFieldEditor({
  field,
  label,
  onChange,
}: {
  field: RunsField;
  label: string;
  onChange: (field: RunsField) => void;
}) {
  return (
    <RunListEditor
      runs={field.runs}
      label={`${label} ${fieldLabel(field.kind)}`}
      multiline={field.kind === "paragraph" || field.kind === "text-line"}
      onChange={(runs) => onChange({ ...field, runs })}
    />
  );
}

function BulletsFieldEditor({
  field,
  label,
  onChange,
}: {
  field: Extract<EntryField, { kind: "bullets" }>;
  label: string;
  onChange: (field: EntryField) => void;
}) {
  return (
    <div className="flex flex-col gap-14">
      {field.items.map((item, itemIndex) => (
        <div className="rounded-cards border border-border-mist bg-cream-paper p-14" key={itemIndex}>
          <div className="mb-9 flex items-center justify-between">
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
              Bullet {itemIndex + 1}
            </p>
            <button
              aria-label={`${label} bullet ${itemIndex + 1} remove`}
              className="inline-flex items-center gap-7 text-caption text-forest-ink hover:text-forest-shadow"
              type="button"
              onClick={() =>
                onChange({
                  ...field,
                  items: field.items.filter((_, index) => index !== itemIndex),
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remove
            </button>
          </div>
          <RunListEditor
            runs={item}
            label={`${label} ${fieldLabel(field.kind)} bullet ${itemIndex + 1}`}
            multiline
            onChange={(runs) =>
              onChange({
                ...field,
                items: field.items.map((current, index) =>
                  index === itemIndex ? runs : current,
                ),
              })
            }
          />
        </div>
      ))}
      <button
        className="inline-flex w-fit items-center gap-7 text-caption font-semibold text-forest-ink hover:text-forest-shadow"
        type="button"
        onClick={() => onChange({ ...field, items: [...field.items, [emptyRun()]] })}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add bullet
      </button>
    </div>
  );
}

function TagsFieldEditor({
  field,
  label,
  onChange,
}: {
  field: Extract<EntryField, { kind: "tags" }>;
  label: string;
  onChange: (field: EntryField) => void;
}) {
  return (
    <div className="flex flex-col gap-9">
      {field.items.map((item, index) => (
        <div className="flex items-center gap-9" key={index}>
          <input
            aria-label={`${label} ${fieldLabel(field.kind)} tag ${index + 1}`}
            className="min-w-0 flex-1 rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body text-charcoal outline-none focus:border-forest-ink"
            value={item}
            onChange={(event) =>
              onChange({
                ...field,
                items: field.items.map((current, itemIndex) =>
                  itemIndex === index ? event.target.value : current,
                ),
              })
            }
          />
          <button
            aria-label={`${label} ${fieldLabel(field.kind)} tag ${index + 1} remove`}
            className="text-forest-ink hover:text-forest-shadow"
            type="button"
            onClick={() =>
              onChange({
                ...field,
                items: field.items.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        className="inline-flex w-fit items-center gap-7 text-caption font-semibold text-forest-ink hover:text-forest-shadow"
        type="button"
        onClick={() => onChange({ ...field, items: [...field.items, ""] })}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add tag
      </button>
    </div>
  );
}

function EntryFieldEditor({
  field,
  label,
  onChange,
  onRemove,
}: {
  field: EntryField;
  label: string;
  onChange: (field: EntryField) => void;
  onRemove: () => void;
}) {
  return (
    <fieldset className="flex flex-col gap-9 rounded-cards bg-mint-veil p-14">
      <div className="flex items-center justify-between gap-14">
        <legend className="text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
          {fieldLabel(field.kind)}
        </legend>
        <button
          aria-label={`Remove ${label} ${fieldLabel(field.kind)}`}
          className="inline-flex items-center gap-7 text-caption text-forest-ink hover:text-forest-shadow"
          type="button"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Remove field
        </button>
      </div>
      {isRunsField(field) && (
        <RunsFieldEditor field={field} label={label} onChange={onChange} />
      )}
      {field.kind === "bullets" && (
        <BulletsFieldEditor field={field} label={label} onChange={onChange} />
      )}
      {field.kind === "tags" && (
        <TagsFieldEditor field={field} label={label} onChange={onChange} />
      )}
    </fieldset>
  );
}

function EntryEditor({
  sectionTitle,
  sectionCatalogId,
  entryIndex,
  entry,
  onFieldChange,
  onFieldAdd,
  onFieldRemove,
  onRemove,
}: {
  sectionTitle: string;
  sectionCatalogId: string;
  entryIndex: number;
  entry: Resume["sections"][number]["entries"][number];
  onFieldChange: (index: number, field: EntryField) => void;
  onFieldAdd: (field: EntryField) => void;
  onFieldRemove: (index: number) => void;
  onRemove: () => void;
}) {
  const [newFieldKind, setNewFieldKind] = useState<EntryFieldKind | "">("");
  const entryLabel = `${sectionTitle} entry ${entryIndex + 1}`;
  const availableFields =
    sectionCatalog.find((item) => item.id === sectionCatalogId)?.fields ?? ["paragraph"];

  return (
    <article className="flex flex-col gap-14 rounded-cards border border-border-mist bg-cream-paper p-18">
      <div className="flex items-center justify-between gap-14">
        <h4 className="font-faire-octave text-heading-sm text-forest-ink">
          Entry {entryIndex + 1}
        </h4>
        <button
          aria-label={`Remove ${entryLabel}`}
          className="inline-flex items-center gap-7 text-caption text-forest-ink hover:text-forest-shadow"
          type="button"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Remove entry
        </button>
      </div>
      {entry.fields.map((field, fieldIndex) => (
        <EntryFieldEditor
          field={field}
          key={`${entry.id}-${fieldIndex}`}
          label={entryLabel}
          onChange={(updatedField) => onFieldChange(fieldIndex, updatedField)}
          onRemove={() => onFieldRemove(fieldIndex)}
        />
      ))}
      <label className="flex flex-col gap-7 text-caption font-semibold text-forest-ink">
        Add Entry Field
        <select
          aria-label={`Add Entry Field to ${entryLabel}`}
          className="w-full rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body font-normal text-charcoal outline-none focus:border-forest-ink"
          value={newFieldKind}
          onChange={(event) => {
            const kind = event.target.value as EntryFieldKind | "";
            setNewFieldKind("");
            if (kind) onFieldAdd(emptyField(kind));
          }}
        >
          <option value="">Choose a field...</option>
          {availableFields.map((kind) => (
            <option key={kind} value={kind}>
              {fieldLabel(kind)}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}

function SectionEditor({
  section,
  onTitleChange,
  onToggle,
  onRemove,
  onEntryAdd,
  onEntryRemove,
  onFieldChange,
  onFieldAdd,
  onFieldRemove,
}: {
  section: Resume["sections"][number];
  onTitleChange: (title: string) => void;
  onToggle: () => void;
  onRemove: () => void;
  onEntryAdd: () => void;
  onEntryRemove: (entryId: string) => void;
  onFieldChange: (entryId: string, fieldIndex: number, field: EntryField) => void;
  onFieldAdd: (entryId: string, field: EntryField) => void;
  onFieldRemove: (entryId: string, fieldIndex: number) => void;
}) {
  return (
    <section className="flex flex-col gap-18 rounded-cards bg-sage-mist p-21 md:p-28">
      <div className="flex flex-col gap-14">
        <div className="flex flex-wrap items-start justify-between gap-14">
          <label className="flex min-w-0 flex-1 flex-col gap-7 text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
            Section title
            <input
              aria-label={`Section title ${section.title}`}
              className="w-full rounded-nav border border-transparent bg-cream-paper px-11 py-9 text-subheading font-normal normal-case tracking-normal text-forest-ink outline-none focus:border-forest-ink"
              value={section.title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </label>
          <div className="flex items-center gap-14 pt-21 text-caption text-forest-ink">
            <label className="inline-flex items-center gap-7">
              <input
                aria-label={`Show ${section.title} section`}
                type="checkbox"
                checked={section.visible}
                onChange={onToggle}
              />
              Show in preview
            </label>
            <button
              aria-label={`Remove ${section.title} section`}
              className="inline-flex items-center gap-7 hover:text-forest-shadow"
              type="button"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
        <p className="text-caption text-charcoal">
          {section.entries.length} {section.entries.length === 1 ? "Entry" : "Entries"}
        </p>
      </div>

      <SortableContext items={section.entries.map((entry) => `entry:${section.id}:${entry.id}`)} strategy={verticalListSortingStrategy}>
      <div className="flex flex-col gap-14">
        {section.entries.map((entry, entryIndex) => (
          <SortableEntry entryId={`entry:${section.id}:${entry.id}`} key={entry.id}>
          <EntryEditor
            entry={entry}
            entryIndex={entryIndex}
            key={entry.id}
            sectionCatalogId={section.catalogId}
            sectionTitle={section.title}
            onFieldAdd={(field) => onFieldAdd(entry.id, field)}
            onFieldChange={(fieldIndex, field) => onFieldChange(entry.id, fieldIndex, field)}
            onFieldRemove={(fieldIndex) => onFieldRemove(entry.id, fieldIndex)}
            onRemove={() => onEntryRemove(entry.id)}
          />
          </SortableEntry>
        ))}
      </div>
      </SortableContext>

      <button
        className="inline-flex w-fit items-center gap-7 rounded-buttons bg-forest-ink px-14 py-9 text-caption font-semibold text-cream-paper hover:bg-forest-shadow"
        type="button"
        onClick={onEntryAdd}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add Entry
      </button>
    </section>
  );
}

function SortableEntry({ entryId, children }: { entryId: string; children: ReactNode }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: entryId });
  return (
    <div ref={(node) => setNodeRef(node)} {...attributes} {...listeners} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "opacity-60" : undefined}>
      {children}
    </div>
  );
}

function SortableSection({ sectionId, children }: { sectionId: string; children: ReactNode }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: `section:${sectionId}` });
  return (
    <div ref={(node) => setNodeRef(node)} {...attributes} {...listeners} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "opacity-60" : undefined}>
      {children}
    </div>
  );
}

function ContactEditor({
  contact,
  onChange,
  onLinkAdd,
  onLinkChange,
  onLinkRemove,
}: {
  contact: Contact;
  onChange: (field: EditableContactField, value: string) => void;
  onLinkAdd: () => void;
  onLinkChange: (index: number, link: ContactLink) => void;
  onLinkRemove: (index: number) => void;
}) {
  return (
    <section className="flex flex-col gap-18 rounded-cards bg-keylime-wash p-21 md:p-28">
      <div>
        <p className="text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
          Contact
        </p>
        <h2 className="mt-9 font-faire-octave text-heading-sm text-forest-ink">
          Contact details
        </h2>
      </div>
      <div className="grid gap-14 md:grid-cols-2">
        {contactFields.map(({ key, label, multiline, type }) => (
          <label className="flex flex-col gap-7 text-caption font-semibold text-forest-ink" key={key}>
            {label}
            {multiline ? (
              <textarea
                aria-label={label}
                className="min-h-70 resize-y rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body font-normal text-charcoal outline-none focus:border-forest-ink"
                value={contact[key]}
                onChange={(event) => onChange(key, event.target.value)}
              />
            ) : (
              <input
                aria-label={label}
                className="rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body font-normal text-charcoal outline-none focus:border-forest-ink"
                type={type ?? "text"}
                value={contact[key]}
                onChange={(event) => onChange(key, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-14">
        <div className="flex items-center justify-between gap-14">
          <p className="text-caption font-semibold text-forest-ink">Links</p>
          <button
            className="inline-flex items-center gap-7 text-caption font-semibold text-forest-ink hover:text-forest-shadow"
            type="button"
            onClick={onLinkAdd}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add contact link
          </button>
        </div>
        {contact.links.map((link, index) => (
          <div className="grid gap-9 md:grid-cols-[1fr_1.4fr_auto]" key={index}>
            <input
              aria-label={`Contact link ${index + 1} label`}
              className="rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body text-charcoal outline-none focus:border-forest-ink"
              placeholder="Label"
              value={link.label}
              onChange={(event) => onLinkChange(index, { ...link, label: event.target.value })}
            />
            <input
              aria-label={`Contact link ${index + 1} URL`}
              className="rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body text-charcoal outline-none focus:border-forest-ink"
              placeholder="https://..."
              value={link.href}
              onChange={(event) => onLinkChange(index, { ...link, href: event.target.value })}
            />
            <button
              aria-label={`Remove contact link ${index + 1}`}
              className="inline-flex items-center justify-center rounded-nav border border-border-mist bg-cream-paper px-11 text-forest-ink hover:text-forest-shadow"
              type="button"
              onClick={() => onLinkRemove(index)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function statusLabel(status: AutosaveStatus): string {
  switch (status) {
    case "pending":
      return "Changes will save in 2 seconds";
    case "saving":
      return "Saving...";
    case "saved":
      return "Saved";
    case "error":
      return "Save failed; keep editing to retry";
    default:
      return "All changes saved";
  }
}

export function MasterProfileEditor({
  initialResume,
  documentMode = false,
  documentId,
  documentName,
}: {
  initialResume: Resume;
  documentMode?: boolean;
  documentId?: string;
  documentName?: string;
}) {
  const [resume, setResume] = useState(initialResume);
  const [dirty, setDirty] = useState(false);
  const [newSectionCatalogId, setNewSectionCatalogId] = useState("");
  const [newCustomSectionTitle, setNewCustomSectionTitle] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);
  const { status } = useAutosave({
    value: resume,
    dirty,
    save: (value, signal) =>
      documentMode && documentId
        ? persistResumeDocument(documentId, value, signal)
        : persistMasterProfile(value, signal),
    unloadSave: (value) =>
      documentMode && documentId
        ? sendResumeDocumentBeacon(documentId, value)
        : sendMasterProfileBeacon(value),
  });

  function updateResume(updater: (current: Resume) => Resume) {
    setResume((current) => updater(current));
    setDirty(true);
    setEditorError(null);
  }

  function changeCompression(delta: number) {
    updateResume((current) => setCompressionLevel(current, current.compressionLevel + delta));
  }

  function changeContact(field: EditableContactField, value: string) {
    updateResume((current) =>
      updateContact(current, { [field]: value } as Partial<Omit<Contact, "links">>),
    );
  }

  function addNewSection() {
    if (newSectionCatalogId === CUSTOM_SECTION_ID) {
      if (!newCustomSectionTitle.trim()) return;
      updateResume((current) => addSection(current, { catalogId: CUSTOM_SECTION_ID, title: newCustomSectionTitle }));
      setNewCustomSectionTitle("");
    } else if (newSectionCatalogId) {
      updateResume((current) => addSection(current, { catalogId: newSectionCatalogId }));
    } else return;
    setNewSectionCatalogId("");
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const active = String(event.active.id);
    const over = String(event.over.id);
    if (active.startsWith("section:") && over.startsWith("section:")) {
      const fromIndex = resume.sections.findIndex((section) => `section:${section.id}` === active);
      const toIndex = resume.sections.findIndex((section) => `section:${section.id}` === over);
      if (fromIndex >= 0 && toIndex >= 0) updateResume((current) => reorderSections(current, fromIndex, toIndex));
      return;
    }
    if (active.startsWith("entry:") && over.startsWith("entry:")) {
      const [, sectionId] = active.split(":");
      const [, overSectionId] = over.split(":");
      if (sectionId !== overSectionId) return;
      const section = resume.sections.find((candidate) => candidate.id === sectionId);
      if (!section) return;
      const fromIndex = section.entries.findIndex((entry) => `entry:${sectionId}:${entry.id}` === active);
      const toIndex = section.entries.findIndex((entry) => `entry:${sectionId}:${entry.id}` === over);
      if (fromIndex >= 0 && toIndex >= 0) updateResume((current) => reorderEntries(current, sectionId, fromIndex, toIndex));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col px-14 pb-70 md:px-28">
      <div className="flex flex-col gap-14 py-35 md:flex-row md:items-end md:justify-between">
        <div>
             <p className="text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
             {documentMode ? "Resume Document" : "Master Profile"}
          </p>
          <h1 className="mt-9 font-faire-octave text-heading text-forest-ink">
             {documentMode ? `Tailor ${documentName ?? "your document"}` : "Edit your baseline"}
          </h1>
          <p className="mt-14 max-w-2xl text-body leading-relaxed text-charcoal">
            Changes appear in the template preview immediately and save automatically after you pause.
          </p>
        </div>
        <p className="rounded-badges bg-keylime-wash px-14 py-9 text-caption text-forest-ink" role="status">
          {statusLabel(status)}
        </p>
      </div>

      {editorError && (
        <p className="mb-21 rounded-cards bg-slate-hush p-18 text-body text-charcoal" role="alert">
          {editorError}
        </p>
      )}

      <div className="grid items-start gap-28 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.9fr)]">
        <div className="flex min-w-0 flex-col gap-21">
          <ContactEditor
            contact={resume.contact}
            onChange={changeContact}
            onLinkAdd={() =>
              updateResume((current) => addContactLink(current, { label: "", href: "" }))
            }
            onLinkChange={(index, link) =>
              updateResume((current) => updateContactLink(current, index, link))
            }
            onLinkRemove={(index) =>
              updateResume((current) => removeContactLink(current, index))
            }
          />

          <div className="flex flex-col gap-21">
            <div className="flex flex-wrap items-end justify-between gap-14">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
                  Sections
                </p>
                <h2 className="mt-9 font-faire-octave text-heading-sm text-forest-ink">
                  Your resume content
                </h2>
              </div>
              <div className="flex flex-wrap items-end gap-9">
                <label className="flex flex-col gap-7 text-caption font-semibold text-forest-ink">
                  Add Section
                  <select
                    aria-label="New section type"
                    className="rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body font-normal text-charcoal outline-none focus:border-forest-ink"
                    value={newSectionCatalogId}
                    onChange={(event) => setNewSectionCatalogId(event.target.value)}
                  >
                    <option value="">Choose a section...</option>
                    {documentMode && <option value={CUSTOM_SECTION_ID}>Custom Section</option>}
                    {sectionCatalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                {documentMode && newSectionCatalogId === CUSTOM_SECTION_ID && (
                  <input aria-label="Custom section title" className="rounded-nav border border-border-mist bg-cream-paper px-11 py-9 text-body text-charcoal" placeholder="Custom section title" value={newCustomSectionTitle} onChange={(event) => setNewCustomSectionTitle(event.target.value)} />
                )}
                <button
                  className="inline-flex items-center gap-7 rounded-buttons bg-forest-ink px-14 py-9 text-caption font-semibold text-cream-paper hover:bg-forest-shadow disabled:opacity-50"
                  disabled={!newSectionCatalogId}
                  type="button"
                  onClick={addNewSection}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add
                </button>
              </div>
            </div>

             {resume.sections.length === 0 ? (
              <div className="rounded-cards bg-keylime-wash p-28 text-body text-charcoal">
                Add a Section to start building your Master Profile.
              </div>
             ) : (
               <DndContext onDragEnd={handleDragEnd}>
               <SortableContext items={resume.sections.map((section) => `section:${section.id}`)} strategy={verticalListSortingStrategy}>
               {resume.sections.map((section) => (
                 <SortableSection sectionId={section.id} key={section.id}>
                 <SectionEditor
                  key={section.id}
                  section={section}
                  onTitleChange={(title) =>
                    updateResume((current) => updateSectionTitle(current, section.id, title))
                  }
                  onToggle={() =>
                    updateResume((current) => toggleSectionVisibility(current, section.id))
                  }
                  onRemove={() =>
                    updateResume((current) => removeSection(current, section.id))
                  }
                  onEntryAdd={() =>
                    updateResume((current) =>
                      addEntry(current, section.id, fieldsForSection(section.catalogId)),
                    )
                  }
                  onEntryRemove={(entryId) =>
                    updateResume((current) => removeEntry(current, section.id, entryId))
                  }
                  onFieldChange={(entryId, fieldIndex, field) =>
                    updateResume((current) =>
                      updateEntryField(current, section.id, entryId, fieldIndex, field),
                    )
                  }
                  onFieldAdd={(entryId, field) =>
                    updateResume((current) => addEntryField(current, section.id, entryId, field))
                  }
                   onFieldRemove={(entryId, fieldIndex) =>
                    updateResume((current) =>
                      removeEntryField(current, section.id, entryId, fieldIndex),
                    )
                   }
                  />
                 </SortableSection>
                ))}
               </SortableContext>
               </DndContext>
             )}
          </div>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-21">
          <div className="flex flex-col gap-14 rounded-cards bg-slate-hush p-14 md:p-21">
            <div className="flex items-center justify-between gap-14 px-7">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
                  Live Preview
                </p>
                <p className="mt-7 text-body text-charcoal">Template-faithful output</p>
              </div>
              <span className="rounded-badges bg-cream-paper px-11 py-7 text-caption text-forest-ink">
                A4
              </span>
            </div>
            {documentMode && (
              <div className="flex items-center justify-between gap-14 border-t border-border-mist px-7 pt-14">
                <div>
                  <p className="text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
                    Compression
                  </p>
                  <p className="mt-7 text-caption text-charcoal">
                    Compress to fit on one page
                  </p>
                </div>
                <div className="flex items-center gap-9">
                  <button
                    aria-label="Decrease compression"
                    className={compressionButtonClass}
                    disabled={resume.compressionLevel <= 0}
                    type="button"
                    onClick={() => changeCompression(-COMPRESSION_STEP)}
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <span
                    aria-label="Compression level"
                    className="min-w-42 text-center text-body font-semibold text-forest-ink"
                  >
                    {resume.compressionLevel}%
                  </span>
                  <button
                    aria-label="Increase compression"
                    className={compressionButtonClass}
                    disabled={resume.compressionLevel >= MAX_COMPRESSION_LEVEL}
                    type="button"
                    onClick={() => changeCompression(COMPRESSION_STEP)}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
            <div className="max-h-[calc(100vh-170px)] overflow-auto rounded-cards bg-cream-paper">
              <ResumeRenderer resume={resume} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
