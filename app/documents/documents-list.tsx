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

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
    <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col px-4 pb-20 sm:px-7 md:px-14 md:pb-28">
      <div className="flex flex-col gap-7 border-b border-rule py-14 sm:py-21 md:flex-row md:items-end md:justify-between md:gap-14">
        <div>
          <p className="font-mono text-caption font-semibold uppercase tracking-[0.12em] text-editorial">
            Document desk / {documents.length.toString().padStart(2, "0")}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-heading text-ink sm:text-heading-lg">
            Resume Documents
          </h1>
          <p className="mt-5 max-w-2xl text-body leading-relaxed text-ink-muted">
            Create independent copies from your Master Profile or clone an
            existing document, then tailor each one without changing its source.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <button
            className="inline-flex min-h-[48px] items-center gap-2 border border-ink bg-ink px-5 py-3 text-body text-newsprint transition-colors hover:border-editorial hover:bg-editorial disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending !== null || !hasMasterProfile}
            type="button"
            onClick={() => void runAction("create")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create from Master Profile
          </button>
          {!hasMasterProfile && (
            <p className="text-caption text-ink-muted">
              Set up your Master Profile first to create new documents.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p
          className="mb-7 border-l-2 border-editorial bg-paper-sunken p-4 text-body text-ink-muted"
          role="alert"
        >
          {error}
        </p>
      )}

      {documents.length === 0 ? (
        <div className="flex flex-col items-start gap-5 border-b border-rule bg-paper-sunken p-7 sm:p-10">
          <span className="flex h-11 w-11 items-center justify-center border border-ink bg-paper-raised text-ink">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-heading-sm text-ink">
              No Resume Documents yet
            </h2>
            <p className="mt-3 max-w-xl text-body leading-relaxed text-ink-muted">
              {hasMasterProfile
                ? "Create your first document from your Master Profile when you are ready to tailor a resume for a specific application."
                : "Import your template to create a Master Profile, then return here to tailor documents from it."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-0 border-l border-rule md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <article
              className="group flex min-h-56 flex-col justify-between gap-7 border-b border-r border-t border-rule bg-paper-raised p-5 transition-colors hover:bg-paper-sunken sm:p-7"
              key={document.id}
            >
              <div className="flex items-start justify-between gap-14">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-rule bg-paper-sunken text-ink">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-mono text-caption text-ink-faint">
                  Updated {formatDate(document.updatedAt)}
                </span>
              </div>
              <div>
                <Link href={`/documents/${document.id}`} className="font-display text-heading-sm text-ink underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-editorial hover:text-editorial">
                  {document.name}
                </Link>
                <p className="mt-2 font-mono text-caption uppercase tracking-[0.06em] text-ink-faint">
                  Created {formatDate(document.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  aria-label={`Clone ${document.name}`}
                  className="inline-flex min-h-[44px] items-center gap-2 border border-rule bg-paper-raised px-3 py-2 text-caption font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
                  disabled={pending !== null}
                  type="button"
                  onClick={() => void runAction("clone", document.id)}
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Clone
                </button>
                <button
                  aria-label={`Delete ${document.name}`}
                  className="inline-flex min-h-[44px] items-center gap-2 border border-rule bg-paper-raised px-3 py-2 text-caption font-semibold text-ink transition-colors hover:border-editorial hover:text-editorial disabled:opacity-50"
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
