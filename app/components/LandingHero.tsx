import { ArrowRight, FileText, Layers, Printer, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: FileText,
    eyebrow: "Import",
    title: "Word in, structure out",
    body: "Drop your OneFit template. Rule-based parsing turns headings and entries into an editable Master Profile — no AI, no guesswork.",
    surface: "bg-sage-mist",
  },
  {
    icon: Layers,
    eyebrow: "Tailor",
    title: "One master, many documents",
    body: "Clone independent Resume Documents for every application. Edit sections and entries without touching your baseline.",
    surface: "bg-mint-veil",
  },
  {
    icon: Printer,
    eyebrow: "Export",
    title: "One page, pixel-true PDF",
    body: "Compress in 10% steps until it fits. What you see in the preview is exactly what native print exports.",
    surface: "bg-keylime-wash",
  },
] as const;

export function LandingHero() {
  return (
    <div className="flex flex-1 flex-col bg-cream-paper">
      <header className="mx-auto flex w-full max-w-[var(--page-max-width)] items-center justify-between px-14 py-21 md:px-28">
        <div className="flex items-center gap-11">
          <span className="flex h-35 w-35 items-center justify-center rounded-nav bg-forest-ink text-body font-semibold text-cream-paper">
            OF
          </span>
          <span className="text-body font-semibold tracking-tight text-charcoal">
            OneFit Resume
          </span>
        </div>
        <nav className="hidden items-center gap-28 text-body text-charcoal md:flex">
          <a href="#features" className="transition-colors hover:text-forest-ink">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-forest-ink">
            How it works
          </a>
          <a href="#faq" className="transition-colors hover:text-forest-ink">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-21">
          <Link
            href="/sign-in"
            className="text-body font-semibold text-charcoal transition-colors hover:text-forest-ink"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-9 rounded-buttons bg-forest-ink px-18 py-11 text-body text-cream-paper transition-colors hover:bg-forest-shadow"
          >
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-[var(--page-max-width)] px-14 pb-56 pt-28 md:px-28 md:pt-42">
          <div className="grid items-stretch gap-21 lg:grid-cols-2 lg:gap-28">
            <div className="flex flex-col justify-center gap-28 rounded-cards bg-keylime-wash p-28 md:p-42">
              <span className="w-fit rounded-badges bg-cream-paper px-14 py-9 text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
                OneFit Resume
              </span>
              <h1 className="font-faire-octave text-heading leading-[1.15] tracking-[-0.03em] text-forest-ink md:text-heading-lg">
                Build perfectly scaled, one-page resumes.
              </h1>
              <p className="max-w-md text-subheading leading-relaxed text-charcoal">
                Import your Word template, edit sections and entries, and export
                a tailored PDF that always fits on a single page — without
                wrestling Word again.
              </p>
              <div className="flex flex-wrap items-center gap-14" id="get-started">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body text-cream-paper transition-colors hover:bg-forest-shadow"
                >
                  Start free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-9 rounded-buttons border border-border-mist bg-cream-paper px-21 py-14 text-body text-forest-ink transition-colors hover:bg-keylime-wash"
                >
                  See how it works
                </a>
              </div>
              <div className="flex flex-wrap gap-9 pt-7">
                {["Master Profile", "Resume Documents", "Native PDF"].map(
                  (label) => (
                    <span
                      key={label}
                      className="rounded-badges bg-cream-paper px-14 py-9 text-body text-forest-ink"
                    >
                      {label}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-cards bg-slate-hush p-28 md:p-42">
              <div className="flex flex-col gap-14">
                <div className="rounded-cards bg-cream-paper p-28">
                  <div className="mb-18 flex items-center justify-between border-b border-border-mist pb-14">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
                        Resume Document
                      </p>
                      <p className="mt-7 font-faire-octave text-heading-sm text-forest-ink">
                        Product Designer
                      </p>
                    </div>
                    <span className="rounded-badges bg-keylime-wash px-14 py-7 text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
                      1 page
                    </span>
                  </div>
                  <div className="space-y-14">
                    <div className="h-11 w-2/3 rounded-full bg-mint-veil" />
                    <div className="h-7 w-full rounded-full bg-border-mist" />
                    <div className="h-7 w-5/6 rounded-full bg-border-mist" />
                    <div className="mt-21 h-11 w-1/2 rounded-full bg-sage-mist" />
                    <div className="h-7 w-full rounded-full bg-border-mist" />
                    <div className="h-7 w-4/5 rounded-full bg-border-mist" />
                    <div className="h-7 w-3/4 rounded-full bg-border-mist" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-14">
                  {["CRM", "EHR", "RCM"].map((label) => (
                    <div
                      key={label}
                      className="rounded-cards bg-cream-paper px-14 py-18 text-center"
                    >
                      <Sparkles
                        className="mx-auto mb-9 h-4 w-4 text-forest-ink"
                        aria-hidden="true"
                      />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-[var(--page-max-width)] px-14 pb-56 md:px-28"
        >
          <div className="mb-42 max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
              Why OneFit
            </p>
            <h2 className="mt-14 font-faire-octave text-heading text-forest-ink">
              Editorial calm. Clinical precision.
            </h2>
            <p className="mt-18 text-body leading-relaxed text-charcoal">
              A botanical greenhouse on cream paper — soft panels, weight-300
              serif headlines, and a single forest-ink action color. The app
              chrome feels quiet; your resume stays exact.
            </p>
          </div>
          <div className="grid gap-21 md:grid-cols-3">
            {features.map(({ icon: Icon, eyebrow, title, body, surface }) => (
              <article
                key={title}
                className={`flex flex-col gap-18 rounded-cards p-28 md:p-42 ${surface}`}
              >
                <span className="flex h-42 w-42 items-center justify-center rounded-nav bg-cream-paper text-forest-ink">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
                  {eyebrow}
                </p>
                <h3 className="font-faire-octave text-heading-sm text-forest-ink">
                  {title}
                </h3>
                <p className="text-body leading-relaxed text-charcoal">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how"
          className="border-y border-border-mist bg-keylime-wash/40"
        >
          <div className="mx-auto grid w-full max-w-[var(--page-max-width)] gap-42 px-14 py-56 md:grid-cols-2 md:px-28 md:py-70">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
                How it works
              </p>
              <h2 className="mt-14 font-faire-octave text-heading text-forest-ink">
                From Word file to print-ready page in three calm steps.
              </h2>
            </div>
            <ol className="flex flex-col gap-0">
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
                  className={`grid grid-cols-[auto_1fr] gap-18 py-21 ${
                    index < 2 ? "border-b border-border-mist" : ""
                  }`}
                >
                  <span className="font-faire-octave text-heading-sm text-forest-ink">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-subheading font-semibold text-forest-ink">
                      {item.title}
                    </h3>
                    <p className="mt-9 text-body leading-relaxed text-charcoal">
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
          className="mx-auto w-full max-w-[var(--page-max-width)] px-14 py-56 md:px-28 md:py-70"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
            Quick answer
          </p>
          <div className="mt-28 flex flex-col">
            {[
              {
                q: "Does the theme change my resume layout?",
                a: "No. App chrome uses the botanical theme; the A4 resume surface keeps the official template design exactly.",
              },
              {
                q: "Will editing a Resume Document change my Master Profile?",
                a: "Never. Documents are independent copies at creation time — tailor freely without risk.",
              },
              {
                q: "How does the one-page fit work?",
                a: "Per-document compression shrinks content in 10% steps. The same scale is mirrored in native browser print.",
              },
            ].map((item, index) => (
              <div
                key={item.q}
                className={`grid gap-18 py-28 md:grid-cols-2 ${
                  index < 2 ? "border-b border-border-mist" : ""
                }`}
              >
                <h3 className="font-faire-octave text-heading-sm text-forest-ink md:text-heading md:leading-[1.2]">
                  {item.q}
                </h3>
                <p className="text-body leading-relaxed text-charcoal md:pt-7">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[var(--page-max-width)] px-14 pb-70 md:px-28">
          <div className="flex flex-col items-start justify-between gap-28 rounded-cards bg-sage-mist p-28 md:flex-row md:items-center md:p-42">
            <div className="max-w-lg">
              <h2 className="font-faire-octave text-heading text-forest-ink">
                Ready when you are.
              </h2>
              <p className="mt-14 text-body leading-relaxed text-charcoal">
                Keep one Master Profile. Ship as many tailored one-page resumes
                as you need.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex shrink-0 items-center gap-9 rounded-buttons bg-forest-ink px-28 py-18 text-body text-cream-paper transition-colors hover:bg-forest-shadow"
            >
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-mist">
        <div className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-col gap-14 px-14 py-28 text-body text-charcoal md:flex-row md:items-center md:justify-between md:px-28">
          <p className="font-semibold text-forest-ink">OneFit Resume</p>
          <p>Open source · Built for the official OneFit Word template</p>
        </div>
      </footer>
    </div>
  );
}
