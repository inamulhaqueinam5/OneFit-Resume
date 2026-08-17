import type { Resume } from "@/lib/resume";

const MASTER_PROFILE_ENDPOINT = "/api/master-profile";
let lastWriteVersion = 0;

function nextWriteVersion(): number {
  lastWriteVersion = Math.max(lastWriteVersion + 1, Date.now());
  return lastWriteVersion;
}

function requestBody(resume: Resume): string {
  return JSON.stringify({ resume, writeVersion: nextWriteVersion() });
}

export async function persistMasterProfile(resume: Resume, signal?: AbortSignal): Promise<void> {
  const response = await fetch(MASTER_PROFILE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: requestBody(resume),
    signal,
  });

  if (!response.ok) {
    throw new Error("Your Master Profile could not be saved.");
  }
}

export function sendMasterProfileBeacon(resume: Resume): boolean {
  const body = new Blob([requestBody(resume)], { type: "application/json" });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    if (navigator.sendBeacon(MASTER_PROFILE_ENDPOINT, body)) return true;
  }

  void fetch(MASTER_PROFILE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
  return false;
}
