"use client";

import { useState } from "react";
import { Copy, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ResumeDocumentMutation } from "@/lib/resume-documents";

export type DocumentSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const ENDPOINT = "/api/resume-documents";

function errorMessage(action: ResumeDocumentMutation): string {
  switch (action) {
    case "create":
      return "Could not create a Resume Document from your Master Profile.";
    case "clone":
      return "Could not clone this Resume Document.";
    case "delete":
      return "Could not delete this Resume Document.";
  }
}

function formatUpdated(updatedAt: string): string {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "";
  return `Updated ${date.toLocaleDateString()}`;
}

export function DocumentsList({
  initialDocuments,
  hasMasterProfile,
}: {
  initialDocuments: DocumentSummary[];
  hasMasterProfile: boolean;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: ResumeDocumentMutation, targetId?: string) {
    const key = action === "create" ? "create" : targetId;
    if (key === undefined) return;
    setPending(key);
    setError(null);
    try {
      if (action === "delete") {
        const response = await fetch(
          `${ENDPOINT}?id=${encodeURIComponent(key)}`,
          { method: "DELETE" },
        );
        if (!response.ok) throw new Error("delete failed");
        setDocuments((current) =>
          current.filter((document) => document.id !== key),
        );
        return;
      }

      const body =
        action === "create"
          ? { action: "create" }
          : { action: "clone", sourceId: key };
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("mutation failed");
      const payload = (await response.json()) as { document: DocumentSummary };
      setDocuments((current) => [payload.document, ...current]);
    } catch {
      setError(errorMessage(action));
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col px-14 pb-70 md:px-28">
      <div className="flex flex-col gap-14 py-35 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-[0.08em] text-forest-ink">
            Resume Documents
          </p>
          <h1 className="mt-9 font-faire-octave text-heading text-forest-ink">
            Tailored resumes for every application
          </h1>
          <p className="mt-14 max-w-2xl text-body leading-relaxed text-charcoal">
            Create independent documents from your Master Profile or clone an
            existing one — each tailored freely without touching the others.
          </p>
        </div>
        <div className="flex flex-col items-start gap-9 md:items-end">
          <button
            className="inline-flex items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body text-cream-paper transition-colors hover:bg-forest-shadow disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending !== null || !hasMasterProfile}
            type="button"
            onClick={() => void runAction("create")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create from Master Profile
          </button>
          {!hasMasterProfile && (
            <p className="text-caption text-charcoal">
              Set up your Master Profile first to create new documents.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p
          className="mb-21 rounded-cards bg-slate-hush p-18 text-body text-charcoal"
          role="alert"
        >
          {error}
        </p>
      )}

      {documents.length === 0 ? (
        <div className="flex flex-col items-start gap-18 rounded-cards bg-keylime-wash p-28 md:p-42">
          <span className="flex h-42 w-42 items-center justify-center rounded-nav bg-cream-paper text-forest-ink">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-faire-octave text-heading-sm text-forest-ink">
              No Resume Documents yet
            </h2>
            <p className="mt-9 text-body leading-relaxed text-charcoal">
              {hasMasterProfile
                ? "Create your first document from your Master Profile when you are ready to tailor a resume for a specific application."
                : "Import your template to create a Master Profile, then return here to tailor documents from it."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-21 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <article
              className="flex flex-col justify-between gap-18 rounded-cards border border-border-mist bg-cream-paper p-21"
              key={document.id}
            >
              <div className="flex items-start justify-between gap-14">
                <span className="flex h-35 w-35 shrink-0 items-center justify-center rounded-nav bg-mint-veil text-forest-ink">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="rounded-badges bg-sage-mist px-11 py-7 text-caption text-forest-ink">
                  {formatUpdated(document.updatedAt)}
                </span>
              </div>
               <Link href={`/documents/${document.id}`} className="font-faire-octave text-heading-sm text-forest-ink hover:text-forest-shadow">
                 {document.name}
               </Link>
              <div className="flex items-center gap-9">
                <button
                  aria-label={`Clone ${document.name}`}
                  className="inline-flex items-center gap-7 rounded-buttons border border-border-mist bg-cream-paper px-14 py-9 text-caption font-semibold text-forest-ink transition-colors hover:bg-keylime-wash disabled:opacity-50"
                  disabled={pending !== null}
                  type="button"
                  onClick={() => void runAction("clone", document.id)}
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Clone
                </button>
                <button
                  aria-label={`Delete ${document.name}`}
                  className="inline-flex items-center gap-7 rounded-buttons border border-border-mist bg-cream-paper px-14 py-9 text-caption font-semibold text-forest-ink transition-colors hover:bg-slate-hush disabled:opacity-50"
                  disabled={pending !== null}
                  type="button"
                  onClick={() => void runAction("delete", document.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
