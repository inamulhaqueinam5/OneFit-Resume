import * as React from "react";
import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "error" | "pending";

const toneClass: Record<StatusTone, string> = {
  neutral: "border-rule text-ink-muted",
  success: "border-ink text-ink",
  error: "border-editorial text-editorial",
  pending: "border-rule text-ink-muted",
};

type StatusProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: StatusTone;
};

const Status = React.forwardRef<HTMLDivElement, StatusProps>(
  ({ className, tone = "neutral", children, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn(
        "inline-flex min-h-[44px] items-center border bg-paper-raised px-3 py-2 text-caption font-medium uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Status.displayName = "Status";

export { Status };
export type { StatusTone };
