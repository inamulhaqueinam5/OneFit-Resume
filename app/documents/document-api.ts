import type { Resume } from "@/lib/resume";

export async function persistResumeDocument(documentId: string, resume: Resume, signal?: AbortSignal) {
  const response = await fetch(`/api/resume-documents?id=${encodeURIComponent(documentId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume }),
    signal,
  });
  if (!response.ok) throw new Error("Resume Document could not be saved.");
}

export function sendResumeDocumentBeacon(documentId: string, resume: Resume): boolean {
  const body = new Blob([JSON.stringify({ resume })], { type: "application/json" });
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    if (navigator.sendBeacon(`/api/resume-documents?id=${encodeURIComponent(documentId)}`, body)) return true;
  }
  void fetch(`/api/resume-documents?id=${encodeURIComponent(documentId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
  return false;
}
