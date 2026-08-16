import { auth, currentUser } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/app/components/EmptyState";
import { loadMasterProfile } from "@/lib/master-profile";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth.protect();

  const profile = await loadMasterProfile(userId);

  if (!profile) {
    const user = await currentUser();
    return <EmptyState name={user?.firstName ?? undefined} />;
  }

  return (
    <div className="flex flex-1 flex-col bg-cream-paper">
      <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col justify-center px-14 py-70 md:px-28">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-ink">
            Master Profile
          </p>
          <h1 className="mt-14 font-faire-octave text-heading text-forest-ink">
            {profile.contact.name || "Your Master Profile"} is ready
          </h1>
          <p className="mt-18 text-body leading-relaxed text-charcoal">
            Your baseline is saved. Tailoring and Resume Document creation are
            coming next — for now you can re-import to refresh your profile.
          </p>
          <a
            href="/import"
            className="mt-28 inline-flex items-center gap-9 rounded-buttons bg-forest-ink px-21 py-14 text-body text-cream-paper transition-colors hover:bg-forest-shadow"
          >
            Import again
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </main>
    </div>
  );
}
