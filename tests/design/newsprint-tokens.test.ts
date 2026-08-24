import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relative: string) =>
  readFileSync(resolve(process.cwd(), relative), "utf8");

describe("Newsprint design tokens", () => {
  it("centralizes the light Newsprint core palette", () => {
    const theme = read("app/styles/newsprint-theme.css");
    expect(theme).toMatch(/--color-newsprint:\s*#F9F9F7/i);
    expect(theme).toMatch(/--color-ink:\s*#111111/i);
    expect(theme).toMatch(/--color-rule:\s*#E5E5E0/i);
    expect(theme).toMatch(/--color-editorial:\s*#CC0000/i);
  });

  it("declares Playfair, Lora, Inter, and JetBrains Mono with fallbacks", () => {
    const theme = read("app/styles/newsprint-theme.css");
    expect(theme).toMatch(/Playfair Display/i);
    expect(theme).toMatch(/Lora/i);
    expect(theme).toMatch(/Inter/i);
    expect(theme).toMatch(/JetBrains Mono/i);
    expect(theme).toMatch(/ui-serif|Georgia/i);
    expect(theme).toMatch(/ui-sans-serif|system-ui/i);
    expect(theme).toMatch(/ui-monospace|monospace/i);
  });

  it("locks app geometry to sharp corners", () => {
    const theme = read("app/styles/newsprint-theme.css");
    expect(theme).toMatch(/--radius(?:-.*)?:\s*0(?:px)?/i);
  });

  it("wires globals to the Newsprint theme and fonts", () => {
    const globals = read("app/globals.css");
    const layout = read("app/layout.tsx");
    expect(globals).toMatch(/newsprint-theme\.css/);
    expect(layout).toMatch(/Playfair_Display|Playfair Display/);
    expect(layout).toMatch(/Lora/);
    expect(layout).toMatch(/Inter/);
    expect(layout).toMatch(/JetBrains_Mono|JetBrains Mono/);
  });

  it("does not alter ResumeRenderer module styles", () => {
    const css = read("components/resume/ResumeRenderer.module.css");
    expect(css).toContain("font-family: Arial, Helvetica, sans-serif");
    expect(css).toContain("width: calc(210mm / var(--resume-scale))");
    expect(css).not.toMatch(/newsprint|editorial|#CC0000|#F9F9F7/i);
  });
});
