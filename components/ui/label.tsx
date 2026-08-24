import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-caption font-semibold uppercase tracking-[0.08em] text-ink font-[family-name:var(--font-mono)]",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
