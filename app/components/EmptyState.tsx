import { ArrowRight, Download, FileText } from "lucide-react";

export function EmptyState({ name }: { name?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-newsprint">
      <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col justify-center px-4 py-20 sm:px-7 md:px-14 md:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-caption font-semibold uppercase tracking-[0.08em] text-editorial">
            Onboarding
          </p>
          <h1 className="mt-4 font-display text-heading text-ink sm:text-heading-lg">
            {name ? `Welcome, ${name}` : "Let's set up your Master Profile"}
          </h1>
          <p className="mt-5 max-w-2xl text-body leading-relaxed text-ink-muted">
            To get started, download the official OneFit template, fill it in with
            your details, and import it. We parse it into an editable Master
            Profile you can tailor into Resume Documents.
          </p>
        </div>

        <div className="mt-28 grid gap-21 md:grid-cols-2">
          <div className="flex flex-col gap-5 border-t border-rule bg-paper-sunken p-7 sm:p-10">
            <span className="flex h-11 w-11 items-center justify-center border border-ink bg-paper-raised text-ink">
              <Download className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="font-mono text-caption font-semibold uppercase tracking-[0.08em] text-editorial">
              Step 1
            </p>
            <h2 className="font-display text-heading-sm text-ink">
              Download the template
            </h2>
            <p className="text-body leading-relaxed text-ink-muted">
              Grab the official OneFit Word template and fill it with your
              education, experience, and skills.
            </p>
            <a
              href="/official-template.docx"
              className="inline-flex min-h-[44px] w-fit items-center gap-2 border border-ink bg-ink px-5 py-3 text-body text-newsprint transition-colors hover:border-editorial hover:bg-editorial"
            >
              Download template
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="flex flex-col gap-5 border-t border-rule bg-paper-sunken p-7 sm:p-10">
            <span className="flex h-11 w-11 items-center justify-center border border-ink bg-paper-raised text-ink">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="font-mono text-caption font-semibold uppercase tracking-[0.08em] text-editorial">
              Step 2
            </p>
            <h2 className="font-display text-heading-sm text-ink">
              Import it
            </h2>
            <p className="text-body leading-relaxed text-ink-muted">
              Upload your completed template. We extract your Contact, Sections,
              and Entries into a Master Profile — after a quick review.
            </p>
            <a
              href="/import"
              className="inline-flex min-h-[44px] w-fit items-center gap-2 border border-ink bg-ink px-5 py-3 text-body text-newsprint transition-colors hover:border-editorial hover:bg-editorial"
            >
              Import your template
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
