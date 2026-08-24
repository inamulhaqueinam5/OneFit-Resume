import * as React from "react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open?: boolean;
  title: string;
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

function Dialog({ open = false, title, children, className, onClose }: DialogProps) {
  const titleId = React.useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss dialog"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 w-full max-w-md border border-ink bg-newsprint p-6 text-ink shadow-none",
          className,
        )}
      >
        <h2
          id={titleId}
          className="font-[family-name:var(--font-display)] text-heading-sm text-ink"
        >
          {title}
        </h2>
        <div className="mt-4 text-body text-ink-muted">{children}</div>
      </div>
    </div>
  );
}

export { Dialog };
