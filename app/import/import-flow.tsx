"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileText,
  RotateCcw,
} from "lucide-react";
import { AppHeader } from "@/app/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Status, type StatusTone } from "@/components/ui/status";
import {
  createMasterProfile,
  parseUploadedDocx,
  type ParsedUpload,
} from "./actions";
import type { Resume } from "@/lib/resume/types";

type Step = "upload" | "review" | "done";

const REVIEW_KIND_LABEL: Record<string, string> = {
  "unmatched-heading": "Unrecognised heading",
  "unmatched-content": "Unmatched content",
  "unmatched-image": "Image outside the header",
};

function statusFor(
  step: Step,
  isPending: boolean,
  error: string | null,
): { label: string; tone: StatusTone } {
  if (error) return { label: "Action needs attention", tone: "error" };
  if (isPending) {
    return {
      label: step === "review" ? "Saving" : "Parsing",
      tone: "pending",
    };
  }
  if (step === "done") return { label: "Saved", tone: "success" };
  if (step === "review") return { label: "Ready for review", tone: "neutral" };
  return { label: "Waiting for a .docx file", tone: "neutral" };
}

export function ImportFlow({ existingProfile }: { existingProfile: Resume | null }) {
  const router = useRouter();
  const isReimport = existingProfile !== null;
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedUpload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const status = statusFor(step, isPending, error);

  async function onUpload(formData: FormData) {
    setError(null);
    setIsPending(true);
    try {
      const result = await parseUploadedDocx(formData);
      setParsed(result);
      setStep("review");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong while parsing the file. Please choose a .docx file and try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onUpload(new FormData(event.currentTarget));
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
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong while saving. Please try again.",
      );
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

      <main className="mx-auto flex min-w-0 w-full max-w-[var(--page-max-width)] flex-1 flex-col px-4 pb-16 sm:px-7 md:pb-20">
        <div className="flex flex-col gap-6 border-b border-rule py-10 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-2xl">
            <p className="font-mono text-caption font-medium uppercase tracking-[0.08em] text-ink-muted">
              Import / {step === "upload" ? "Choose file" : step === "review" ? "Review" : "Complete"}
            </p>
            <h1 className="mt-3 font-display text-heading tracking-[-0.02em] text-ink">
              {step === "done"
                ? isReimport
                  ? "Master Profile updated"
                  : "Master Profile created"
                : "Import your Word template"}
            </h1>
            <p className="mt-4 max-w-[70ch] font-body text-body leading-relaxed text-ink-muted">
              {step === "done"
                ? isReimport
                  ? "Your Master Profile and its imported Sections were refreshed. Existing Resume Documents were left unchanged."
                  : "Your baseline is ready. Resume Documents can now be tailored from it."
                : "Upload the official OneFit template. We parse it into a structured Master Profile and show anything we could not match before it is saved."}
            </p>
          </div>
          <Status tone={status.tone}>{status.label}</Status>
        </div>

        {existingProfile && step !== "done" && (
          <Card
            aria-describedby="overwrite-description"
            aria-labelledby="overwrite-title"
            className="mt-7 border-editorial bg-paper-raised"
          >
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-editorial" aria-hidden="true" />
              <div>
                <h2 id="overwrite-title" className="font-ui text-body font-semibold text-ink">
                  Existing Master Profile
                </h2>
                <p id="overwrite-description" className="mt-1 font-body text-body leading-relaxed text-ink-muted">
                  You already have a Master Profile for{" "}
                  <span className="font-semibold text-ink">{existingProfile.contact.name || "an existing profile"}</span>.{" "}
                  Importing a new file will overwrite it after you confirm the review.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mt-7 border-editorial" role="alert" aria-labelledby="import-error-title">
            <CardContent className="p-5">
              <h2 id="import-error-title" className="font-ui text-body font-semibold text-editorial">
                We could not complete that action.
              </h2>
              <p className="mt-1 font-body text-body text-ink-muted">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-7">
          {step === "upload" && (
            <Card aria-labelledby="upload-title">
              <CardHeader className="bg-paper-sunken">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center border border-rule bg-paper-raised text-ink">
                    <FileText className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle id="upload-title">Choose a .docx file</CardTitle>
                    <p className="mt-2 max-w-[65ch] font-body text-body leading-relaxed text-ink-muted">
                      Non-official files are still parsed best-effort, with a warning before anything is saved.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5">
                  <Label htmlFor="template-file" className="flex flex-col gap-2">
                    Word template file
                    <Input
                      id="template-file"
                      name="file"
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      required
                      className="h-auto cursor-pointer py-3"
                    />
                  </Label>
                  <Button type="submit" disabled={isPending} className="w-fit">
                    {isPending ? "Parsing..." : "Parse template"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "review" && parsed && (
            <div className="flex flex-col gap-5">
              {!parsed.isOfficialTemplate && parsed.warning && (
                <Card aria-labelledby="parse-warning-title" className="border-rule bg-paper-sunken">
                  <CardContent className="flex items-start gap-3 p-5">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-ink" aria-hidden="true" />
                    <div>
                      <h2 id="parse-warning-title" className="font-ui text-body font-semibold text-ink">
                        Best-effort parse
                      </h2>
                      <p className="mt-1 font-body text-body text-ink-muted">{parsed.warning}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card aria-labelledby="parsed-result-title">
                <CardHeader>
                  <p className="font-mono text-caption font-medium uppercase tracking-[0.08em] text-ink-muted">
                    Review step
                  </p>
                  <CardTitle id="parsed-result-title">Parsed result</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-heading-sm text-ink">
                    {parsed.resume.contact.name || "Untitled profile"}
                  </p>
                  {parsed.resume.sections.length > 0 ? (
                    <div className="mt-5 divide-y divide-rule border-y border-rule">
                      {parsed.resume.sections.map((section) => (
                        <div key={section.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                          <span className="font-ui text-body font-semibold text-ink">{section.title}</span>
                          <span className="font-mono text-caption text-ink-muted">
                            {section.entries.length} {section.entries.length === 1 ? "entry" : "entries"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 border-t border-rule pt-5">
                      <p className="font-ui text-body font-semibold text-ink">No Sections found</p>
                      <p className="mt-1 font-body text-body text-ink-muted">
                        You can still save this Contact and add Sections later in your Master Profile.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card aria-labelledby="review-items-title" className="bg-paper-sunken">
                <CardHeader className="border-b-0 pb-0">
                  <CardTitle id="review-items-title">Review before saving</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  {parsed.review.length === 0 ? (
                    <p className="font-body text-body text-ink-muted">
                      Everything matched the template. Nothing needs review.
                    </p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-rule border-y border-rule">
                      {parsed.review.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 py-4">
                          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-editorial" aria-hidden="true" />
                          <div>
                            <p className="font-ui text-body font-semibold text-ink">
                              {REVIEW_KIND_LABEL[item.kind] ?? item.kind}
                            </p>
                            {item.text && <p className="mt-1 font-body text-body text-ink-muted">{item.text}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  disabled={isPending}
                  aria-describedby={isReimport ? "overwrite-title overwrite-description" : undefined}
                  onClick={() => void onConfirm()}
                >
                  <Check aria-hidden="true" />
                  {isPending ? "Saving..." : isReimport ? "Confirm & update Master Profile" : "Confirm & create Master Profile"}
                </Button>
                <Button type="button" variant="outline" disabled={isPending} onClick={onReset}>
                  <RotateCcw aria-hidden="true" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <Card aria-labelledby="saved-title" className="border-ink">
              <CardContent className="flex flex-col items-start gap-5 p-6 md:p-8">
                <div className="flex size-12 items-center justify-center bg-ink text-newsprint">
                  <Check className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="saved-title" className="font-display text-heading-sm text-ink">Saved successfully</h2>
                  <p className="mt-2 max-w-[65ch] font-body text-body leading-relaxed text-ink-muted">
                    {isReimport
                      ? "Your Master Profile is updated and existing Resume Documents remain unchanged."
                      : "Your Master Profile is saved and loads back on reload."}
                  </p>
                </div>
                <Button type="button" onClick={onReset}>
                  Import again
                  <RotateCcw aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
