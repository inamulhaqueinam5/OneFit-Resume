import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-[44px] items-center justify-center gap-2 border border-transparent px-4 py-2 text-body font-medium font-[family-name:var(--font-ui)] transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-newsprint)] focus-visible:outline focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--focus-ring-color)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-newsprint hover:bg-newsprint hover:text-ink hover:border-ink",
        outline:
          "border-ink bg-transparent text-ink hover:bg-ink hover:text-newsprint",
        editorial:
          "bg-editorial text-newsprint hover:bg-newsprint hover:text-editorial hover:border-editorial",
        ghost: "border-transparent text-ink hover:bg-paper-sunken",
        link: "min-h-0 border-transparent px-0 text-ink underline-offset-4 hover:text-editorial hover:underline",
      },
      size: {
        default: "px-5 py-2.5",
        sm: "min-h-[44px] px-3 py-2 text-caption",
        lg: "min-h-[48px] px-7 py-3",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
