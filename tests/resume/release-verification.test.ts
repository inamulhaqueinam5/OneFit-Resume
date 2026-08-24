import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { persistResumeDocument } from "@/app/documents/document-api";
import type { Resume } from "@/lib/resume";

const read = (relative: string) =>
  readFileSync(resolve(process.cwd(), relative), "utf8");

describe("resume release boundaries", () => {
  it("scopes print-target layout rules to the editor shell", () => {
    const globals = read("app/globals.css");

    expect(globals).toMatch(
      /body:has\(\.master-profile-editor \.resume-print-target\) \.master-profile-editor/,
    );
    expect(globals).not.toContain("body:has(.resume-print-target)");
  });

  it("keeps official resume typography and page geometry in the renderer module", () => {
    const rendererStyles = read("components/resume/ResumeRenderer.module.css");

    expect(rendererStyles).toContain("font-family: Arial, Helvetica, sans-serif");
    expect(rendererStyles).toContain("font-size: 9.5pt");
    expect(rendererStyles).toContain("@page { size: A4;");
    expect(rendererStyles).toContain("break-inside: avoid");
    expect(rendererStyles).not.toMatch(/newsprint|editorial|--font-/i);
  });

  it("persists the document compression level through the document API", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const resume = { compressionLevel: 70 } as Resume;

    await persistResumeDocument("doc/1", resume);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/resume-documents?id=doc%2F1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ resume }),
      }),
    );
    fetchMock.mockRestore();
  });
});
