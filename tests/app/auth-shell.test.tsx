import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relative: string) =>
  readFileSync(resolve(process.cwd(), relative), "utf8");

describe("Auth shell composition", () => {
  it("sign-in page keeps Brand and Clerk SignIn with shared appearance", () => {
    const source = read("app/sign-in/[[...sign-in]]/page.tsx");
    expect(source).toContain("Brand");
    expect(source).toContain("SignIn");
    expect(source).toContain("clerkAppearance");
    expect(source).toContain('fallbackRedirectUrl="/dashboard"');
  });

  it("sign-up page keeps Brand and Clerk SignUp with shared appearance", () => {
    const source = read("app/sign-up/[[...sign-up]]/page.tsx");
    expect(source).toContain("Brand");
    expect(source).toContain("SignUp");
    expect(source).toContain("clerkAppearance");
    expect(source).toContain('fallbackRedirectUrl="/dashboard"');
  });

  it("Clerk appearance uses Newsprint sharp geometry and ink palette", () => {
    const source = read("lib/clerk-appearance.ts");
    expect(source).toMatch(/colorPrimary:\s*"#CC0000"|colorPrimary:\s*"#cc0000"/i);
    expect(source).toMatch(/colorBackground:\s*"#F9F9F7"|colorBackground:\s*"#f9f9f7"/i);
    expect(source).toMatch(/colorText:\s*"#111111"|colorText:\s*"#111"/i);
    expect(source).toMatch(/borderRadius:\s*"0(?:px)?"/);
  });
});
