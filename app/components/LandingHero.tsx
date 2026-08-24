import { ArrowRight, FileText, Layers, Printer } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/app/components/Brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconBox } from "@/components/ui/icon-box";

const features = [
  {
    icon: FileText,
    eyebrow: "Import",
    title: "Word in, structure out",
    body: "Drop your OneFit template. Rule-based parsing turns headings and entries into an editable Master Profile — no AI, no guesswork.",
  },
  {
    icon: Layers,
    eyebrow: "Tailor",
    title: "One master, many documents",
    body: "Clone independent Resume Documents for every application. Edit sections and entries without touching your baseline.",
  },
  {
    icon: Printer,
    eyebrow: "Export",
    title: "One page, pixel-true PDF",
    body: "Compress in 10% steps until it fits. What you see in the preview is exactly what native print exports.",
  },
] as const;

export function LandingHero({ signedIn = false }: { signedIn?: boolean }) {
  const primaryCta = signedIn
    ? { href: "/dashboard", label: "Go to dashboard" }
    : { href: "/sign-up", label: "Get started" };

  return (
    <div className="newsprint-texture flex flex-1 flex-col text-ink">
      <header className="border-b border-rule bg-newsprint/90">
        <div className="mx-auto flex w-full max-w-[var(--page-max-width)] items-center justify-between gap-4 px-4 py-3 md:px-7">
          <Brand />
          <nav
            aria-label="Landing"
            className="hidden items-center gap-1 md:flex"
          >
            {[
              { href: "#features", label: "Features" },
              { href: "#how", label: "How it works" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex min-h-[44px] items-center px-3 py-2 font-[family-name:var(--font-ui)] text-body text-ink transition-colors hover:text-editorial focus-visible:outline focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--focus-ring-color)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {!signedIn && (
              <Button asChild variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
            <Button asChild>
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="border-b border-rule bg-newsprint/80">
          <div className="mx-auto grid w-full max-w-[var(--page-max-width)] lg:grid-cols-2">
            <div className="flex flex-col justify-center gap-6 border-rule px-4 py-12 md:px-7 md:py-16 lg:border-r">
              <p className="w-fit border border-ink bg-paper-raised px-3 py-2 font-[family-name:var(--font-mono)] text-caption font-semibold uppercase tracking-[0.08em] text-ink">
                OneFit Resume
              </p>
              <h1 className="max-w-xl font-[family-name:var(--font-display)] text-heading leading-[1.08] tracking-[-0.02em] text-ink md:text-heading-lg">
                Build perfectly scaled, one-page resumes.
              </h1>
              <p className="max-w-md font-[family-name:var(--font-body)] text-subheading leading-relaxed text-ink-muted">
                Import your Word template, edit sections and entries, and export
                a tailored PDF that always fits on a single page — without
                wrestling Word again.
              </p>
              <div
                className="flex flex-wrap items-center gap-3"
                id="get-started"
              >
                <Button asChild size="lg">
                  <Link href={primaryCta.href}>
                    {signedIn ? primaryCta.label : "Start free"}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-2 border-t border-rule pt-5">
                {["Master Profile", "Resume Documents", "Native PDF"].map(
                  (label) => (
                    <li
                      key={label}
                      className="border border-ink px-3 py-2 font-[family-name:var(--font-mono)] text-caption uppercase tracking-[0.08em] text-ink"
                    >
                      {label}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="flex flex-col justify-center bg-paper-sunken px-4 py-12 md:px-7 md:py-16">
              <Card
                aria-label="Sample Resume Document"
                className="bg-paper-raised p-0"
              >
                <div className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-caption font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      Resume Document
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-heading-sm text-ink">
                      Product Designer
                    </p>
                  </div>
                  <span className="border border-editorial px-2 py-1 font-[family-name:var(--font-mono)] text-caption font-semibold uppercase tracking-[0.08em] text-editorial">
                    1 page
                  </span>
                </div>
                <div className="space-y-3 px-5 py-5" aria-hidden="true">
                  <div className="h-3 w-2/3 bg-ink/15" />
                  <div className="h-2 w-full bg-rule" />
                  <div className="h-2 w-5/6 bg-rule" />
                  <div className="mt-5 h-3 w-1/2 bg-ink/20" />
                  <div className="h-2 w-full bg-rule" />
                  <div className="h-2 w-4/5 bg-rule" />
                  <div className="h-2 w-3/4 bg-rule" />
                </div>
                <div className="grid grid-cols-3 border-t border-rule">
                  {["CRM", "EHR", "RCM"].map((label, index) => (
                    <div
                      key={label}
                      className={`px-3 py-4 text-center ${
                        index < 2 ? "border-r border-rule" : ""
                      }`}
                    >
                      <p className="font-[family-name:var(--font-mono)] text-caption font-semibold uppercase tracking-[0.1em] text-ink">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-14 md:px-7 md:py-20"
        >
          <div className="mb-10 max-w-2xl border-b border-rule pb-8">
            <p className="font-[family-name:var(--font-mono)] text-caption font-semibold uppercase tracking-[0.08em] text-ink">
              Why OneFit
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-heading text-ink">
              Editorial calm. Clinical precision.
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] text-body leading-relaxed text-ink-muted">
              A botanical greenhouse on cream paper — soft panels, weight-300
              serif headlines, and a single forest-ink action color. The app
              chrome feels quiet; your resume stays exact.
            </p>
          </div>
          <div className="grid border border-rule bg-paper-raised/90 md:grid-cols-3">
            {features.map(({ icon: Icon, eyebrow, title, body }, index) => (
              <article
                key={title}
                className={`flex flex-col gap-4 p-6 md:p-8 ${
                  index < features.length - 1
                    ? "border-b border-rule md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                <IconBox label={title}>
                  <Icon aria-hidden="true" />
                </IconBox>
                <p className="font-[family-name:var(--font-mono)] text-caption font-semibold uppercase tracking-[0.08em] text-ink">
                  {eyebrow}
                </p>
                <h3 className="font-[family-name:var(--font-display)] text-heading-sm text-ink">
                  {title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-body leading-relaxed text-ink-muted">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-rule bg-paper-sunken">
          <div className="mx-auto grid w-full max-w-[var(--page-max-width)] gap-10 px-4 py-14 md:grid-cols-2 md:px-7 md:py-20">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-caption font-semibold uppercase tracking-[0.08em] text-ink">
                How it works
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-heading text-ink">
                From Word file to print-ready page in three calm steps.
              </h2>
            </div>
            <ol className="flex flex-col border border-rule bg-paper-raised">
              {[
                {
                  step: "01",
                  title: "Import the official template",
                  body: "Upload once. We extract Contact, Sections, and Entries with deterministic rules.",
                },
                {
                  step: "02",
                  title: "Edit your Master Profile",
                  body: "Reorder, hide, or add custom sections. Every change autosaves to your profile.",
                },
                {
                  step: "03",
                  title: "Clone, compress, print",
                  body: "Spin up Resume Documents, scale to one page, and export via the browser.",
                },
              ].map((item, index) => (
                <li
                  key={item.step}
                  className={`grid grid-cols-[auto_1fr] gap-4 px-5 py-5 ${
                    index < 2 ? "border-b border-rule" : ""
                  }`}
                >
                  <span className="font-[family-name:var(--font-mono)] text-caption font-semibold text-editorial">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-[family-name:var(--font-ui)] text-subheading font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-[family-name:var(--font-body)] text-body leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-14 md:px-7 md:py-20"
        >
          <h2 className="font-[family-name:var(--font-display)] text-heading text-ink">
            Quick answer
          </h2>
          <div className="mt-8 flex flex-col border-t border-rule">
            {[
              {
                q: "Does the theme change my resume layout?",
                a: "No. App chrome uses the Newsprint system; the A4 resume surface keeps the official template design exactly.",
              },
              {
                q: "Will editing a Resume Document change my Master Profile?",
                a: "Never. Documents are independent copies at creation time — tailor freely without risk.",
              },
              {
                q: "How does the one-page fit work?",
                a: "Per-document compression shrinks content in 10% steps. The same scale is mirrored in native browser print.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="grid gap-4 border-b border-rule py-7 md:grid-cols-2"
              >
                <h3 className="font-[family-name:var(--font-display)] text-heading-sm text-ink md:text-heading md:leading-[1.15]">
                  {item.q}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-body leading-relaxed text-ink-muted md:pt-1">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-rule">
          <div className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center md:px-7 md:py-16">
            <div className="max-w-lg">
              <h2 className="font-[family-name:var(--font-display)] text-heading text-ink">
                Ready when you are.
              </h2>
              <p className="mt-3 font-[family-name:var(--font-body)] text-body leading-relaxed text-ink-muted">
                Keep one Master Profile. Ship as many tailored one-page resumes
                as you need.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-col gap-2 px-4 py-6 font-[family-name:var(--font-ui)] text-body text-ink-muted md:flex-row md:items-center md:justify-between md:px-7">
          <p className="font-semibold text-ink">OneFit Resume</p>
          <p>Open source · Built for the official OneFit Word template</p>
        </div>
      </footer>
    </div>
  );
}
