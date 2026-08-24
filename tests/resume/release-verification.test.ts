import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relative: string) =>
  readFileSync(resolve(process.cwd(), relative), "utf8");

describe("resume release boundaries", () => {
  it("scopes print-target layout rules to the editor shell", () => {
    const globals = read("app/globals.css");

    expect(globals).toMatch(
      /body:has\(\.master-profile-editor \.resume-print-target\) \.master-profile-editor/,
    );
    expect(globals).not.toMatch(
      /body:has\(\.resume-print-target\) (?:main|\.resume-preview-panel|#resume-preview-pane)/,
    );
  });

  it("keeps official resume typography and page geometry in the renderer module", () => {
    const rendererStyles = read("components/resume/ResumeRenderer.module.css");

    expect(rendererStyles).toContain("font-family: Arial, Helvetica, sans-serif");
    expect(rendererStyles).toContain("font-size: 9.5pt");
    expect(rendererStyles).toContain("@page { size: A4;");
    expect(rendererStyles).toContain("break-inside: avoid");
    expect(rendererStyles).not.toMatch(/newsprint|editorial|--font-/i);
  });
});
