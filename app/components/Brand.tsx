import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center border border-ink bg-ink font-[family-name:var(--font-mono)] text-caption font-semibold tracking-[0.08em] text-newsprint"
      >
        OF
      </span>
      <span className="font-[family-name:var(--font-ui)] text-body font-semibold tracking-tight text-ink">
        OneFit Resume
      </span>
    </div>
  );
}
