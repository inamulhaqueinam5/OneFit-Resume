import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { sectionCatalog, type Entry, type EntryField, type Resume, type TextRun } from "@/lib/resume";
import styles from "./ResumeRenderer.module.css";

type ResumeRendererProps = {
  resume: Resume;
  className?: string;
};

function renderRuns(runs: TextRun[]): ReactNode {
  return runs.map((run, index) => {
    let content: ReactNode = run.text;
    if (run.bold && run.italic) content = <strong><em>{content}</em></strong>;
    else if (run.bold) content = <strong>{content}</strong>;
    else if (run.italic) content = <em>{content}</em>;

    if (run.href) {
      content = (
        <a href={run.href} target="_blank" rel="noreferrer">
          {content}
        </a>
      );
    }

    return <span key={`${run.text}-${index}`}>{content}</span>;
  });
}

function renderField(field: EntryField, entryId: string, index: number, textLineStyle: "paragraph" | "line"): ReactNode {
  const key = `${entryId}-${field.kind}-${index}`;
  switch (field.kind) {
    case "title":
      return <div className={styles.title} key={key}>{renderRuns(field.runs)}</div>;
    case "subtitle":
      return <div className={styles.subtitle} key={key}>{renderRuns(field.runs)}</div>;
    case "dates":
      return <div className={styles.dates} key={key}>{renderRuns(field.runs)}</div>;
    case "paragraph":
      return <p className={styles.paragraph} key={key}>{renderRuns(field.runs)}</p>;
    case "bullets":
      return (
        <ul className={styles.bullets} key={key}>
          {field.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderRuns(item)}</li>)}
        </ul>
      );
    case "tags":
      return (
        <ul className={styles.tags} key={key}>
          {field.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      );
    case "text-line":
      if (textLineStyle === "paragraph") {
        return <p className={styles.publication} key={key}>{renderRuns(field.runs)}</p>;
      }
      return <div className={styles.textLine} key={key}>{renderRuns(field.runs)}</div>;
  }
}

function renderEntry(entry: Entry, textLineStyle: "paragraph" | "line"): ReactNode {
  return (
    <div className={styles.entry} key={entry.id}>
      {entry.fields.map((field, index) => renderField(field, entry.id, index, textLineStyle))}
    </div>
  );
}

function ContactLine({ label, children }: { label: string; children: ReactNode }) {
  return <span className={styles.contactLine}><strong>{label}: </strong>{children}</span>;
}

export function ResumeRenderer({ resume, className }: ResumeRendererProps) {
  const scale = resume.compressionLevel / 100;
  const pageClassName = [styles.page, className].filter(Boolean).join(" ");
  const pageStyle = { "--resume-scale": scale } as CSSProperties;

  return (
    <div
      className={styles.canvas}
      role="document"
        data-compression-level={resume.compressionLevel}
        style={pageStyle}
    >
      <article
        className={pageClassName}
        aria-label={`${resume.contact.name || "Resume"} resume`}
      >
        <header className={styles.header}>
          <div className={styles.identity}>
            <h1>{resume.contact.name}</h1>
            <p className={styles.tagline}>{resume.contact.tagline}</p>
            <div className={styles.contact}>
              {resume.contact.email && <ContactLine label="Email"><a href={`mailto:${resume.contact.email}`}>{resume.contact.email}</a></ContactLine>}
              {resume.contact.phone && <ContactLine label="Phone"><a href={`tel:${resume.contact.phone}`}>{resume.contact.phone}</a></ContactLine>}
              {resume.contact.location && <ContactLine label="Location">{resume.contact.location}</ContactLine>}
              {resume.contact.links.map((link) => <a className={styles.headerLink} href={link.href} key={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
              {resume.contact.availability && <ContactLine label="Availability">{resume.contact.availability}</ContactLine>}
            </div>
          </div>
          <div className={styles.pictureSlot} aria-label="Profile picture slot">
            {resume.profilePicture && (
              <Image
                src={resume.profilePicture.dataUrl}
                alt={`${resume.contact.name || "Resume"} profile picture`}
                width={106}
                height={106}
                unoptimized
              />
            )}
          </div>
        </header>

        <main className={styles.sections}>
          {resume.sections.filter((section) => section.visible).map((section) => (
            <section className={styles.section} data-catalog-id={section.catalogId} key={section.id}>
              <h2>{section.title}</h2>
              <div>{section.entries.map((entry) => renderEntry(entry, sectionCatalog.find((item) => item.id === section.catalogId)?.textLineStyle ?? "line"))}</div>
            </section>
          ))}
        </main>
      </article>
    </div>
  );
}
