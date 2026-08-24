"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Check, FileText, RotateCcw } from "lucide-react";
import { AppHeader } from "@/app/components/AppHeader";
import { createMasterProfile, parseUploadedDocx, type ParsedUpload } from "./actions";
import type { Resume } from "@/lib/resume/types";

type Step = "upload" | "review" | "done";

const REVIEW_KIND_LABEL: Record<string, string> = {
  "unmatched-heading": "Unrecognised heading",
  "unmatched-content": "Unmatched content",
  "unmatched-image": "Image outside the header",
};

export function ImportFlow({ existingProfile }: { existingProfile: Resume | null }) {
  const router = useRouter();
  const isReimport = existingProfile !== null;
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedUpload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onUpload(formData: FormData) {
    setError(null);
    setIsPending(true);
    try {
      const result = await parseUploadedDocx(formData);
      setParsed(result);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while parsing the file.");
    } finally {
      setIsPending(false);
    }
  }

  async function onConfirm() {
    if (!parsed) return;
    setError(null);
    setIsPending(true);
    try {
      await createMasterProfile(parsed.resume);
      setStep("done");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while saving.");
    } finally {
      setIsPending(false);
    }
  }

  function onReset() {
    setParsed(null);
    setError(null);
    setStep("upload");
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-newsprint">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col px-4 pb-20 sm:px-7 md:px-14 md:pb-28">
        <div className="mb-28 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
            Import
          </p>
          <h1 className="mt-14 font-faire-octave text-heading text-forest-ink">
            {step === "done"
              ? isReimport
                ? "Master Profile updated"
                : "Master Profile created"
              : "Import your Word template"}
          </h1>
          <p className="mt-18 text-body leading-relaxed text-charcoal">
            {step === "done"
              ? isReimport
                ? "Your Master Profile and its imported Sections were refreshed. Existing Resume Documents were left unchanged."
                : "Your baseline is ready. Resume Documents can now be tailored from it."
              : "Upload the official OneFit template. We parse it into a structured Master Profile and show anything we could not match before it is saved."}
          </p>
        </div>

        {existingProfile && step !== "done" && (
          <div className="mb-28 flex items-start gap-14 rounded-cards bg-keylime-wash p-28">
            <AlertTriangle className="mt-4 h-4 w-4 shrink-0 text-forest-ink" aria-hidden="true" />
            <p className="text-body leading-relaxed text-charcoal">
              You already have a Master Profile for{" "}
              <span className="font-semibold text-forest-ink">
                {existingProfile.contact.name || "an existing profile"}
              </span>
              . Importing a new file will overwrite it after you confirm the review.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-7 border-l-2 border-editorial bg-paper-sunken p-4 text-body text-ink-muted" role="alert">
            {error}
          </div>
        )}

        {step === "upload" && (
          <div className="rounded-cards bg-keylime-wash p-28 md:p-42">
            <form action={onUpload} className="flex flex-col gap-21">
              <div className="flex items-start gap-14">
                <FileText className="mt-4 h-4 w-4 shrink-0 text-forest-ink" aria-hidden="true" />
                <div>
                  <p className="text-subheading font-semibold text-forest-ink">
                    Choose a .docx file
                  </p>
                  <p className="mt-9 text-body text-charcoal">
                    Non-official files are still parsed best-effort, with a warning before
                    anything is saved.
                  </p>
                </div>
              </div>
              <label htmlFor="template-file" className="text-caption font-semibold uppercase tracking-[0.08em] text-ink">
                Word template file
              </label>
              <input
                id="template-file"
                type="file"
                name="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                className="min-h-[44px] text-body text-ink-muted"
              />
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex w-fit items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body text-cream-paper transition-colors hover:bg-forest-shadow disabled:opacity-60"
              >
                {isPending ? "Parsing…" : "Parse template"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        )}

        {step === "review" && parsed && (
          <div className="flex flex-col gap-21">
            {!parsed.isOfficialTemplate && parsed.warning && (
              <div className="flex items-start gap-14 rounded-cards bg-slate-hush p-28">
                <AlertTriangle
                  className="mt-4 h-4 w-4 shrink-0 text-forest-ink"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-subheading font-semibold text-forest-ink">
                    Best-effort parse
                  </p>
                  <p className="mt-9 text-body text-charcoal">{parsed.warning}</p>
                </div>
              </div>
            )}

            <div className="rounded-cards bg-cream-paper border border-border-mist p-28">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
                Parsed result
              </p>
              <p className="mt-14 font-faire-octave text-heading-sm text-forest-ink">
                {parsed.resume.contact.name || "Untitled profile"}
              </p>
              <div className="mt-18 flex flex-col gap-9">
                {parsed.resume.sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between border-b border-border-mist pb-9"
                  >
                    <span className="text-body font-semibold text-forest-ink">
                      {section.title}
                    </span>
                    <span className="text-body text-charcoal">
                      {section.entries.length}{" "}
                      {section.entries.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-cards bg-keylime-wash p-28">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
                Review before saving
              </p>
              {parsed.review.length === 0 ? (
                <p className="mt-14 text-body text-charcoal">
                  Everything matched the template — nothing needs review.
                </p>
              ) : (
                <ul className="mt-14 flex flex-col gap-14">
                  {parsed.review.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-11 rounded-cards bg-cream-paper px-18 py-14"
                    >
                      <AlertTriangle
                        className="mt-4 h-4 w-4 shrink-0 text-forest-ink"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-body font-semibold text-forest-ink">
                          {REVIEW_KIND_LABEL[item.kind] ?? item.kind}
                        </p>
                        {item.text && (
                          <p className="mt-7 text-body text-charcoal">{item.text}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-14">
              <button
                onClick={onConfirm}
                disabled={isPending}
                className="inline-flex items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body text-cream-paper transition-colors hover:bg-forest-shadow disabled:opacity-60"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                {isPending
                  ? "Saving…"
                  : isReimport
                    ? "Confirm & update Master Profile"
                    : "Confirm & create Master Profile"}
              </button>
              <button
                onClick={onReset}
                disabled={isPending}
                className="inline-flex items-center gap-9 rounded-buttons border border-border-mist bg-cream-paper px-21 py-14 text-body text-forest-ink transition-colors hover:bg-keylime-wash disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-start gap-21 bg-paper-sunken p-7 sm:p-10" role="status" aria-live="polite">
            <Check className="h-5 w-5 text-forest-ink" aria-hidden="true" />
            <p className="text-subheading font-semibold text-forest-ink">
              {isReimport
                ? "Your Master Profile is updated and existing Resume Documents remain unchanged."
                : "Your Master Profile is saved and loads back on reload."}
            </p>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body text-cream-paper transition-colors hover:bg-forest-shadow"
            >
              Import again
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
