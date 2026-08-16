import { ArrowRight, Download, FileText } from "lucide-react";

export function EmptyState({ name }: { name?: string }) {
  return (
    <div className="flex flex-1 flex-col bg-cream-paper">
      <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col justify-center px-14 py-70 md:px-28">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
            Onboarding
          </p>
          <h1 className="mt-14 font-faire-octave text-heading text-forest-ink">
            {name ? `Welcome, ${name}` : "Let's set up your Master Profile"}
          </h1>
          <p className="mt-18 text-body leading-relaxed text-charcoal">
            To get started, download the official OneFit template, fill it in with
            your details, and import it. We parse it into an editable Master
            Profile you can tailor into Resume Documents.
          </p>
        </div>

        <div className="mt-28 grid gap-21 md:grid-cols-2">
          <div className="flex flex-col gap-18 rounded-cards bg-keylime-wash p-28 md:p-42">
            <span className="flex h-42 w-42 items-center justify-center rounded-nav bg-cream-paper text-forest-ink">
              <Download className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
              Step 1
            </p>
            <h2 className="font-faire-octave text-heading-sm text-forest-ink">
              Download the template
            </h2>
            <p className="text-body leading-relaxed text-charcoal">
              Grab the official OneFit Word template and fill it with your
              education, experience, and skills.
            </p>
            <a
              href="/official-template.docx"
              className="inline-flex w-fit items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body text-cream-paper transition-colors hover:bg-forest-shadow"
            >
              Download template
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="flex flex-col gap-18 rounded-cards bg-sage-mist p-28 md:p-42">
            <span className="flex h-42 w-42 items-center justify-center rounded-nav bg-cream-paper text-forest-ink">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
              Step 2
            </p>
            <h2 className="font-faire-octave text-heading-sm text-forest-ink">
              Import it
            </h2>
            <p className="text-body leading-relaxed text-charcoal">
              Upload your completed template. We extract your Contact, Sections,
              and Entries into a Master Profile — after a quick review.
            </p>
            <a
              href="/import"
              className="inline-flex w-fit items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body text-cream-paper transition-colors hover:bg-forest-shadow"
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
