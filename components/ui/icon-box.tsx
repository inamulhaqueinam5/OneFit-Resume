import * as React from "react";
import { cn } from "@/lib/utils";

type IconBoxProps = React.HTMLAttributes<HTMLSpanElement> & {
  label: string;
};

const IconBox = React.forwardRef<HTMLSpanElement, IconBoxProps>(
  ({ className, label, children, ...props }, ref) => (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center border border-ink bg-paper-raised text-ink [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
IconBox.displayName = "IconBox";

export { IconBox };
