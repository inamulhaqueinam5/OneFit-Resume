import { ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative flex flex-1 items-center justify-center bg-cream-paper px-14 py-56">
      <div className="mx-auto grid w-full max-w-[var(--page-max-width)] gap-28 rounded-cards bg-keylime-wash p-42 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-21">
          <span className="w-fit rounded-badges bg-cream-paper px-14 py-9 text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
            OneFit Resume
          </span>
          <h1 className="font-faire-octave text-heading text-forest-ink">
            Build perfectly scaled, one-page resumes.
          </h1>
          <p className="max-w-md text-body text-charcoal">
            Import your Word template, edit sections and entries, and export a
            tailored PDF that always fits on one page.
          </p>
          <button className="inline-flex w-fit items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body font-normal text-cream-paper transition-colors hover:bg-forest-shadow">
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="rounded-cards bg-slate-hush p-42">
          <div className="rounded-cards bg-cream-paper p-28 shadow-none">
            <p className="text-subheading text-forest-ink">Resume preview</p>
            <p className="mt-14 text-body text-charcoal">
              Your document surface stays separate from the app chrome — the
              botanical theme never leaks into the printed page.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
